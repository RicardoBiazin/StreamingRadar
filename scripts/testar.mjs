// Confere os dados e o site gerado. Sai com código 1 se algo estiver errado.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { lerJSON, caminho, VERSAO, EXEMPLO, segunda, slugSemana } from './util.mjs';
import { REDES } from '../src/redes.mjs';
import { lerOmdb } from './fontes/omdb.mjs';

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
    }
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

for (const rel of ['assets/estilo.css', 'assets/app.js', 'favicon.svg', 'robots.txt', '404.html']) {
  ok(existsSync(`${pub}/${rel}`), `public/${rel} não existe`);
}
for (const f of paginas) ok(sitemap.includes(`/semana/${f}`), `sitemap sem ${f}`);

if (erros.length) {
  console.error(`✗ ${erros.length} problema(s):\n- ` + erros.slice(0, 40).join('\n- '));
  process.exit(1);
}
console.log(`✓ testes ok: ${dados.itens.length} itens, ${todas.length} páginas${EXEMPLO ? ' (EXEMPLO)' : ''}`);
