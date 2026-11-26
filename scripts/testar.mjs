// Confere os dados e o site gerado. Sai com código 1 se algo estiver errado.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { lerJSON, caminho, VERSAO, EXEMPLO, segunda, slugSemana } from './util.mjs';
import { REDES } from '../src/redes.mjs';
import { lerOmdb } from './fontes/omdb.mjs';
import detalheFn, { montarDetalhe } from '../netlify/functions/detalhe.mjs';

const erros = [];
const ok = (cond, msg) => { if (!cond) erros.push(msg); };

// Parser da OMDb (formato documentado em omdbapi.com).
const amostra = lerOmdb({ Response: 'True', Metascore: '76', imdbRating: '8.4', imdbVotes: '1,234,567', Ratings: [{ Source: 'Internet Movie Database', Value: '8.4/10' }, { Source: 'Rotten Tomatoes', Value: '87%' }, { Source: 'Metacritic', Value: '76/100' }] });
ok(amostra && amostra.imdb === 8.4 && amostra.votos === 1234567 && amostra.rt === 87 && amostra.mc === 76, 'lerOmdb não leu a amostra completa');
const vazia = lerOmdb({ Response: 'True', imdbRating: 'N/A', imdbVotes: 'N/A', Metascore: 'N/A', Ratings: [] });
ok(vazia && vazia.imdb === null && vazia.rt === null && vazia.mc === null, 'lerOmdb deveria devolver nulls para N/A');
ok(lerOmdb({ Response: 'False', Error: 'Incorrect IMDb ID.' }) === null, 'lerOmdb deveria devolver null para Response False');
const notasCache = lerJSON('dados/notas.json', {});
for (const [id, n] of Object.entries(notasCache)) {
  ok(/^tt\d+$/.test(id), `notas.json: id do IMDb inválido ${id}`);
  ok(n.imdb == null || (n.imdb >= 0 && n.imdb <= 10), `notas.json: IMDb fora de 0-10 em ${id}`);
  ok(n.rt == null || (n.rt >= 0 && n.rt <= 100), `notas.json: RT fora de 0-100 em ${id}`);
  ok(n.mc == null || (n.mc >= 0 && n.mc <= 100), `notas.json: MC fora de 0-100 em ${id}`);
}

const dados = lerJSON('dados/lancamentos.json');
ok(dados, 'dados/lancamentos.json não existe');
if (dados) {
  ok(EXEMPLO || dados.fonte === 'tmdb', `dado não é do TMDB (fonte=${dados.fonte}): recuso publicar`);
  ok(dados.itens.length > 0, 'nenhum item em lancamentos.json');
  const ids = new Set();
  for (const i of dados.itens) {
    ok(!ids.has(i.id), `id repetido: ${i.id}`);
    ids.add(i.id);
    ok(/^\d{4}-\d{2}-\d{2}$/.test(i.data), `${i.id}: data inválida ${i.data}`);
    ok(i.data >= dados.de && i.data <= dados.ate, `${i.id}: data ${i.data} fora da janela`);
    ok(i.semana === slugSemana(i.data) && i.segunda === segunda(i.data), `${i.id}: semana inconsistente`);
    ok(i.titulo && i.titulo.trim(), `${i.id}: sem título`);
    if (i.tipo === 'serie') ok(i.plataformas.length > 0, `${i.id}: sem plataforma`);
  }
}

const pub = caminho('public');
const lerPag = (rel) => (existsSync(pub + '/' + rel) ? readFileSync(pub + '/' + rel, 'utf8') : null);
const index = lerPag('index.html');
ok(index, 'public/index.html não existe');

const paginas = existsSync(pub + '/semana') ? readdirSync(pub + '/semana').filter((f) => f.endsWith('.html')) : [];
ok(paginas.length >= 8, `poucas páginas de semana (${paginas.length})`);

const todas = [['index.html', index], ...paginas.map((f) => [`semana/${f}`, lerPag(`semana/${f}`)])];
const sitemap = lerPag('sitemap.xml') || '';
ok(sitemap.includes('<urlset'), 'sitemap.xml ausente');

for (const [nome, html] of todas) {
  if (!html) continue;
  ok(html.includes(`>v${VERSAO}</span>`), `${nome}: versão ${VERSAO} não aparece no cabeçalho`);
  ok(/TMDB/.test(html) && /JustWatch/.test(html), `${nome}: faltam créditos TMDB/JustWatch`);
  ok(/<link rel="canonical"/.test(html), `${nome}: sem canonical`);
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '';
  ok(desc.length >= 100 && desc.length <= 200, `${nome}: description com ${desc.length} caracteres`);
  // CSP do netlify.toml: nada de script ou estilo inline (JSON-LD não executa, vale).
  const pasta = nome.includes('/') ? nome.slice(0, nome.lastIndexOf('/') + 1) : '';
  ok(!/<script(?![^>]*(src=|application\/ld\+json))/.test(html), `${nome}: script inline`);
  ok(!/<style[\s>]/.test(html) && !/\sstyle="/.test(html), `${nome}: estilo inline`);
  for (const h of html.matchAll(/href="([^"]+)"/g)) {
    const alvo = h[1].replace(/&amp;/g, '&');
    if (/^https?:\/\//.test(alvo) || alvo.startsWith('#') || alvo.startsWith('mailto:')) {
      ok(!alvo.startsWith('http://'), `${nome}: link sem https ${alvo}`);
      continue;
    }
    if (alvo.startsWith('/')) {
      const f = alvo.split('#')[0] || '/';
      const arq = f === '/' ? 'index.html' : f.slice(1);
      ok(existsSync(pub + '/' + arq), `${nome}: link interno quebrado ${alvo}`);
    } else {
      // o site é relativo para abrir também direto do disco: confere o arquivo a partir da pasta da página
      const destino = resolve(pub, pasta, alvo.split('#')[0].split('?')[0] || 'index.html');
      // sem catálogo coletado (modo exemplo), o link do menu para /catalogo/ não tem destino
      const semCatalogo = !existsSync(caminho('dados/catalogo/bruto.json')) && /catalogo\/?$/.test(alvo);
      ok(semCatalogo || existsSync(destino) || (existsSync(destino) === false && existsSync(resolve(destino, 'index.html'))), `${nome}: link relativo quebrado ${alvo}`);
    }
  }
  // folhas de estilo, scripts e imagens do próprio site também precisam existir (e abrir sem servidor)
  for (const s of html.matchAll(/(?:src|href)="([^"]+\.(?:css|js|svg))"/g)) {
    if (/^https?:\/\//.test(s[1])) continue;
    ok(!s[1].startsWith('/'), `${nome}: arquivo com caminho absoluto ${s[1]} (não abre direto do disco)`);
    ok(existsSync(resolve(pub, pasta, s[1])), `${nome}: arquivo do site não existe ${s[1]}`);
  }
  const cinemas = html.match(/<section class="bloco" id="cinema">[\s\S]*?<\/section>/)?.[0] || '';
  const nCards = (cinemas.match(/<article class="card"/g) || []).length;
  for (const r of REDES) {
    const n = (cinemas.match(new RegExp(`class="chip rede" href="[^"]+" rel="noopener">${r.nome.replace('.', '\\.')}<`, 'g')) || []).length;
    ok(n === nCards, `${nome}: rede ${r.nome} em ${n} de ${nCards} cartões de cinema`);
  }
  ok(!/class="quando"><\/p>/.test(html), `${nome}: data vazia no cartão`);
  ok(!/\bundefined\b|\bNaN\b|\[object Object\]/.test(html), `${nome}: texto quebrado (undefined/NaN/[object Object])`);
}

// ---------- detalhe (modal) ----------
{
  const amostraTv = montarDetalhe('tv', { id: 1, name: 'S', original_name: 'S', overview: 'x', first_air_date: '2026-01-02', created_by: [{ name: 'Criador' }], genres: [{ name: 'Drama' }], vote_average: 7.46, vote_count: 10, number_of_seasons: 2, number_of_episodes: 16, credits: { cast: [{ name: 'A', character: 'B', profile_path: '/a.jpg' }] }, 'watch/providers': { results: { BR: { link: 'https://x', flatrate: [{ provider_name: 'Netflix', logo_path: '/n.jpg' }, { provider_name: 'Netflix Standard with Ads', logo_path: '/n2.jpg' }] } } }, external_ids: { imdb_id: 'tt1' } });
  ok(amostraTv.dir[0] === 'Criador' && amostraTv.el[0].n === 'A' && amostraTv.n === 7.5 && amostraTv.temp === 2, 'montarDetalhe(tv) não leu a amostra');
  ok(amostraTv.pl.assinatura.length === 1 && amostraTv.imdb === 'tt1', 'montarDetalhe(tv) deveria ignorar variante com anúncios e ler o IMDb');
  const amostraFilme = montarDetalhe('movie', { id: 2, title: 'F', release_date: '2026-03-04', runtime: 100, credits: { crew: [{ job: 'Director', name: 'Dir' }, { job: 'Writer', name: 'W' }], cast: [] }, imdb_id: 'tt2' });
  ok(amostraFilme.dir.join() === 'Dir' && amostraFilme.r === 100 && amostraFilme.d === '2026-03-04', 'montarDetalhe(movie) não leu a amostra');
  const ruim = await detalheFn(new Request('http://x/api/detalhe?tipo=movie&id=abc'));
  ok(ruim.status === 400, 'função de detalhe deveria recusar id inválido com 400');
  const ruim2 = await detalheFn(new Request('http://x/api/detalhe?tipo=person&id=1'));
  ok(ruim2.status === 400, 'função de detalhe deveria recusar tipo inválido com 400');

  const det = lerJSON('dados/detalhes.json', null);
  const idx0 = lerPag('index.html') || '';
  const nDet = (idx0.match(/data-det="1"/g) || []).length;
  if (det) {
    ok(nDet > 0, 'nenhum cartão da semana atual tem data-det (detalhes não ligados aos cartões)');
    for (const m of idx0.matchAll(/data-tipo="(movie|tv)" data-id="(\d+)" data-det="1"/g)) {
      const arq = `${pub}/detalhe/${m[1]}-${m[2]}.json`;
      ok(existsSync(arq), `detalhe/${m[1]}-${m[2]}.json não existe`);
      if (existsSync(arq)) {
        const j = JSON.parse(readFileSync(arq, 'utf8'));
        ok(j.t && Array.isArray(j.el) && Array.isArray(j.dir) && j.pl, `detalhe/${m[1]}-${m[2]}.json incompleto`);
      }
    }
  }
  ok(new RegExp(`<script src="(\\.\\./)?assets/detalhe\\.js\\?v=${VERSAO.replace(/\./g, '\\.')}"`).test(idx0), 'index.html sem assets/detalhe.js?v=<versão> (cache dos navegadores)');
  ok(existsSync(`${pub}/assets/detalhe.js`), 'assets/detalhe.js não existe');
  ok(/\[functions\][\s\S]*netlify\/functions/.test(readFileSync(caminho('netlify.toml'), 'utf8')), 'netlify.toml sem o diretório de funções');
}

// ---------- filtros por gênero ----------
{
  const idx1 = lerPag('index.html') || '';
  ok(/id="f-gen"/.test(idx1), 'index.html sem a faixa de gêneros (#f-gen)');
  const cartoes = idx1.match(/<article class="card"[^>]*>/g) || [];
  ok(cartoes.length > 0 && cartoes.every((c) => /data-gen="/.test(c)), 'cartão da semana sem data-gen');
  const gens = [...idx1.matchAll(/<button type="button" data-gen="([a-z0-9-]+)"/g)].map((m) => m[1]);
  for (const g of gens) ok(cartoes.some((c) => new RegExp(`data-gen="[^"]*\\b${g}\\b`).test(c)), `chip de gênero "${g}" sem nenhum cartão`);
}

// ---------- catálogo ----------
const bruto = lerJSON('dados/catalogo/bruto.json');
if (bruto) {
  ok(bruto.plataformas.length >= 10, `catálogo com poucas plataformas (${bruto.plataformas.length})`);
  const cidx = lerPag('catalogo/index.html');
  ok(cidx && cidx.includes('id="b-busca"'), 'catalogo/index.html sem a busca');
  for (const id of ['b-gen', 'b-tipo', 'b-plat', 'b-ord', 'b-grade', 'b-mais']) ok(cidx && cidx.includes(`id="${id}"`), `catalogo/index.html sem #${id} (filtros do índice)`);
  if (existsSync(pub + '/catalogo/busca.json')) {
    const bj = JSON.parse(readFileSync(pub + '/catalogo/busca.json', 'utf8'));
    ok(bj.i.length > 1000 && bj.i.every((i) => i.length === 9 && Array.isArray(i[7]) && Array.isArray(i[8]) && i[8].length > 0), 'busca.json: linhas sem os 9 campos (gêneros e plataformas)');
    ok(bj.g && Object.keys(bj.g).length > 5 && bj.p.length === bruto.plataformas.length, 'busca.json: gêneros ou plataformas ausentes');
  }
  ok(existsSync(pub + '/catalogo/busca.json'), 'catalogo/busca.json não existe');
  ok(existsSync(pub + '/assets/catalogo.js'), 'assets/catalogo.js não existe');
  for (const p of bruto.plataformas) ok(p.itens.length > 0, `catálogo: ${p.nome} sem itens`);
  const links = [...(cidx || '').matchAll(/href="(?:\.\.)?\/?(catalogo\/[^"]+\.html)"/g)].map((m) => '/' + m[1]);
  ok(links.length >= bruto.plataformas.length, `índice do catálogo lista ${links.length} plataformas, esperado ${bruto.plataformas.length}`);
  for (const l of links) {
    const h = lerPag(l.slice(1));
    ok(h, `catálogo: página ${l} não existe`);
    if (!h) continue;
    ok(h.includes(`>v${VERSAO}</span>`) && /TMDB/.test(h), `${l}: versão ou créditos ausentes`);
    ok(/<script src="(\.\.\/)?assets\/catalogo\.js\?v=[0-9.]+"/.test(h) && !/<script(?![^>]*(src=|application\/ld\+json))/.test(h), `${l}: scripts inválidos`);
    const js = l.replace('.html', '.json').slice(1);
    ok(existsSync(pub + '/' + js), `catálogo: ${js} não existe`);
    if (existsSync(pub + '/' + js)) {
      const j = JSON.parse(readFileSync(pub + '/' + js, 'utf8'));
      ok(Array.isArray(j.i) && j.i.length > 0 && j.i.every((i) => i.length === 8 && (i[0] === 0 || i[0] === 1) && i[2]), `${js}: linhas inválidas`);
    }
    ok(!/\bundefined\b|\bNaN\b|\[object Object\]/.test(h), `${l}: texto quebrado`);
  }
}

for (const rel of ['assets/estilo.css', 'assets/app.js', 'favicon.svg', 'robots.txt', '404.html']) {
  ok(existsSync(`${pub}/${rel}`), `public/${rel} não existe`);
}
for (const f of paginas) ok(sitemap.includes(`/semana/${f}`), `sitemap sem ${f}`);

if (erros.length) {
  console.error(`✗ ${erros.length} problema(s):\n- ` + erros.slice(0, 40).join('\n- '));
  process.exit(1);
}
console.log(`✓ testes ok: ${dados.itens.length} itens, ${todas.length} páginas${EXEMPLO ? ' (EXEMPLO)' : ''}`);
