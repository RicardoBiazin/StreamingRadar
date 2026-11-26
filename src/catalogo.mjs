// Catálogo completo por plataforma: public/catalogo/index.html, /<plataforma>.html,
// /<plataforma>.json (carregado pelo navegador) e busca.json (busca entre plataformas).

import { lerJSON, gravarTexto, esc, slug, VERSAO, SITE } from '../scripts/util.mjs';
import { pagina } from './layout.mjs';
import { sitePlataforma } from './plataformas.mjs';
import { TEMAS } from './temas.mjs';

const IMG = 'https://image.tmdb.org/t/p/';
const INICIAL = 48; // cartões já no HTML (SEO e navegador sem JS)
const fmtNum = (n) => n.toLocaleString('pt-BR');

export function gerarCatalogo() {
  const bruto = lerJSON('dados/catalogo/bruto.json');
  if (!bruto) {
    console.log('Sem dados/catalogo/bruto.json: catálogo não gerado (rode `npm run catalogo`).');
    return { paginas: [] };
  }
  const nomesGen = bruto.generos;

  // slug único por plataforma
  const usados = new Set();
  const plats = bruto.plataformas.map((p) => {
    let s = slug(p.nome) || `p${p.id}`;
    if (usados.has(s)) s = `${s}-${p.id}`;
    usados.add(s);
    return { ...p, slug: s, site: sitePlataforma(p.nome), filmes: p.itens.filter((i) => i[0] === 0).length, series: p.itens.filter((i) => i[0] === 1).length };
  }).sort((a, b) => b.itens.length - a.itens.length);

  const cartao = (i, nomesPlat = null) => {
    const [tipo, id, titulo, ano, nota, votos, poster, gen] = i;
    const onde = nomesPlat?.length ? `<p class="plats-mini">${esc(nomesPlat.slice(0, 3).join(' · '))}${nomesPlat.length > 3 ? ` +${nomesPlat.length - 3}` : ''}</p>` : '';
    const url = `https://www.themoviedb.org/${tipo ? 'tv' : 'movie'}/${id}`;
    const meta = [ano, tipo ? 'Série' : 'Filme', ...gen.slice(0, 2).map((g) => nomesGen[g]).filter(Boolean)].filter(Boolean).join(' · ');
    return `<article class="mini" data-tipo="${tipo ? 'tv' : 'movie'}" data-id="${id}"><a class="capa" href="${url}" rel="noopener">${poster
      ? `<img class="poster" src="${IMG}w185/${esc(poster)}" alt="Pôster de ${esc(titulo)}" width="185" height="278" loading="lazy" referrerpolicy="no-referrer">`
      : `<div class="poster sem" aria-hidden="true">${esc(titulo.slice(0, 1))}</div>`}</a>
<div class="mini-info"><h3><a href="${url}" rel="noopener">${esc(titulo)}</a></h3><p class="meta">${esc(meta)}</p>${nota ? `<p class="nota-mini">★ ${nota.toFixed(1).replace('.', ',')} <span>TMDB</span></p>` : ''}${onde}<p class="links"><a href="${url}" rel="noopener">TMDB</a> · <a href="https://www.justwatch.com/br/busca?q=${encodeURIComponent(titulo)}" rel="noopener">JustWatch</a></p></div></article>`;
  };

  const paginas = [];

  // Cada página do catálogo sai no Padrão (/catalogo/) e em cada tema (/<tema>/catalogo/): o mesmo conteúdo
  // e os mesmos JSON, com o skin do tema (modelos/<tema>/catalogo.css). Só o Padrão entra no sitemap.
  function emitir(rel, titulo, descricao, corpo) {
    const arq = rel || 'index.html';
    const scripts = ['/assets/catalogo.js'];
    gravarTexto(`public/catalogo/${arq}`, pagina({ titulo, descricao, caminho: `/catalogo/${rel}`, corpo, scripts, catalogo: rel }));
    for (const t of TEMAS.filter((x) => x.id !== 'padrao')) {
      gravarTexto(`public/${t.id}/catalogo/${arq}`, pagina({
        titulo: titulo.replace(' | Streaming Radar', ` | Streaming Radar (${t.nome})`), descricao,
        caminho: `/${t.id}/catalogo/${rel}`, canonico: `/catalogo/${rel}`, tema: t.id, catalogo: rel, scripts,
        corpo: corpo.replaceAll('href="/catalogo/', `href="/${t.id}/catalogo/`),
      }));
    }
  }

  // ---------- uma página por plataforma ----------
  for (const p of plats) {
    const usadosGen = new Set(p.itens.flatMap((i) => i[7]));
    const generos = Object.fromEntries([...usadosGen].filter((g) => nomesGen[g]).map((g) => [g, nomesGen[g]]));
    gravarTexto(`public/catalogo/${p.slug}.json`, JSON.stringify({ n: p.nome, g: generos, i: p.itens }));

    // gêneros do mais frequente ao menos, com a contagem (como as categorias dos serviços de streaming)
    const contGen = {};
    for (const i of p.itens) for (const g of i[7]) contGen[g] = (contGen[g] || 0) + 1;
    const opcoes = Object.entries(generos).map(([id, n]) => [id, n, contGen[id] || 0]).sort((a, b) => b[2] - a[2] || a[1].localeCompare(b[1], 'pt-BR'));
    const titulo = `Catálogo ${p.nome} no Brasil: ${fmtNum(p.itens.length)} filmes e séries | Streaming Radar`;
    const descricao = `Tudo o que está disponível na ${p.nome} no Brasil: ${fmtNum(p.filmes)} filmes e ${fmtNum(p.series)} séries, com busca, filtro por gênero e links.`;
    const corpo = `<nav class="migalha" aria-label="Você está em"><a href="/catalogo/">Catálogo</a> › ${esc(p.nome)}</nav>
<div class="semana-tit esq"><h1>${esc(p.nome)}: catálogo no Brasil</h1>
<p>${fmtNum(p.filmes)} filmes · ${fmtNum(p.series)} séries${p.site ? ` · <a href="${esc(p.site)}" rel="noopener">site da ${esc(p.nome)}</a>` : ''}</p></div>
<div class="cat-controles">
  <label>Buscar <input type="search" id="c-busca" placeholder="título..." autocomplete="off"></label>
  <label>Ordem <select id="c-ord"><option value="pop">Mais populares</option><option value="nota">Melhor nota</option><option value="ano">Mais recentes</option><option value="az">A a Z</option></select></label>
</div>
<div class="chips-gen" id="c-tipo" role="group" aria-label="Filtrar por tipo"><button type="button" data-v="" aria-pressed="true">Filmes e séries</button><button type="button" data-v="0" aria-pressed="false">Filmes <span>${fmtNum(p.filmes)}</span></button><button type="button" data-v="1" aria-pressed="false">Séries <span>${fmtNum(p.series)}</span></button></div>
<div class="chips-gen" id="c-gen" role="group" aria-label="Filtrar por gênero"><button type="button" data-v="" aria-pressed="true">Todos os gêneros</button>${opcoes.map(([id, n, qtd]) => `<button type="button" data-v="${id}" aria-pressed="false">${esc(n)} <span>${fmtNum(qtd)}</span></button>`).join('')}</div>
<p class="cat-status" id="c-status" aria-live="polite">${fmtNum(p.itens.length)} títulos</p>
<div class="grade-cat" id="catalogo" data-json="/catalogo/${esc(p.slug)}.json">
${p.itens.slice(0, INICIAL).map(cartao).join('\n')}
</div>
<p class="mais"><button type="button" id="c-mais">Mostrar mais</button></p>`;
    emitir(`${p.slug}.html`, titulo, descricao, corpo);
    paginas.push(`/catalogo/${p.slug}.html`);
  }

  // ---------- índice de busca entre plataformas ----------
  // Um item por título, com as mesmas 8 colunas dos arquivos por plataforma + a lista de
  // plataformas (índices em `p`). A ordem é a popularidade: melhor posição em qualquer plataforma.
  const idx = new Map();
  plats.forEach((p, k) => {
    p.itens.forEach((i, pos) => {
      const chave = `${i[0]}-${i[1]}`;
      let e = idx.get(chave);
      if (!e) { e = { item: [...i, []], rank: pos }; idx.set(chave, e); }
      e.rank = Math.min(e.rank, pos);
      e.item[8].push(k);
    });
  });
  const ordenados = [...idx.values()].sort((a, b) => a.rank - b.rank || b.item[8].length - a.item[8].length).map((e) => e.item);
  const usadosTodos = {};
  for (const i of ordenados) for (const g of i[7]) usadosTodos[g] = (usadosTodos[g] || 0) + 1;
  const generosTodos = Object.fromEntries(Object.keys(usadosTodos).filter((g) => nomesGen[g]).map((g) => [g, nomesGen[g]]));
  const busca = { p: plats.map((p) => ({ s: p.slug, n: p.nome })), g: generosTodos, i: ordenados };
  gravarTexto('public/catalogo/busca.json', JSON.stringify(busca));
  const unicos = idx.size;
  const nFilmes = ordenados.filter((i) => i[0] === 0).length;
  const chipsGen = Object.entries(generosTodos).map(([id, n]) => [id, n, usadosTodos[id]]).sort((a, b) => b[2] - a[2] || a[1].localeCompare(b[1], 'pt-BR'));

  // ---------- índice do catálogo ----------
  const titulo = `Catálogo de streaming no Brasil: ${fmtNum(unicos)} filmes e séries | Streaming Radar`;
  const descricao = `Descubra onde assistir: catálogo completo de ${plats.length} plataformas de streaming no Brasil, com ${fmtNum(unicos)} filmes e séries, busca entre plataformas e links.`;
  const corpo = `<div class="semana-tit"><h1>Catálogo de streaming</h1><p>${fmtNum(unicos)} filmes e séries em ${plats.length} plataformas no Brasil (assinatura, grátis ou com anúncios)</p></div>
<div id="b-area">
<div class="cat-controles">
  <label class="larga">Onde assistir? <input type="search" id="b-busca" placeholder="digite o título de um filme ou série..." autocomplete="off"></label>
  <label>Plataforma <select id="b-plat"><option value="">Todas</option>${plats.map((p, k) => `<option value="${k}">${esc(p.nome)}</option>`).join('')}</select></label>
  <label>Ordem <select id="b-ord"><option value="pop">Mais populares</option><option value="nota">Melhor nota</option><option value="ano">Mais recentes</option><option value="az">A a Z</option></select></label>
</div>
<div class="chips-gen" id="b-tipo" role="group" aria-label="Filtrar por tipo"><button type="button" data-v="" aria-pressed="true">Filmes e séries</button><button type="button" data-v="0" aria-pressed="false">Filmes <span>${fmtNum(nFilmes)}</span></button><button type="button" data-v="1" aria-pressed="false">Séries <span>${fmtNum(unicos - nFilmes)}</span></button></div>
<div class="chips-gen" id="b-gen" role="group" aria-label="Filtrar por gênero"><button type="button" data-v="" aria-pressed="true">Todos os gêneros</button>${chipsGen.map(([id, n, qtd]) => `<button type="button" data-v="${id}" aria-pressed="false">${esc(n)} <span>${fmtNum(qtd)}</span></button>`).join('')}</div>
</div>
<p class="cat-status" id="b-status" aria-live="polite">${fmtNum(unicos)} títulos em ${plats.length} plataformas (os mais populares abaixo; mexa nos filtros para ver todos)</p>
<div class="grade-cat" id="b-grade" data-json="/catalogo/busca.json">
${ordenados.slice(0, INICIAL).map((i) => cartao(i, i[8].map((k) => plats[k].nome))).join('\n')}
</div>
<p class="mais"><button type="button" id="b-mais">Mostrar mais</button></p>
<h2 class="plat-tit">Plataformas</h2>
<ul class="plat-lista" id="b-plats">
${plats.map((p) => `<li><a href="/catalogo/${esc(p.slug)}.html"><strong>${esc(p.nome)}</strong><span>${fmtNum(p.filmes)} filmes · ${fmtNum(p.series)} séries</span></a></li>`).join('\n')}
</ul>`;
  emitir('', titulo, descricao, corpo);
  paginas.push('/catalogo/');

  console.log(`catálogo: ${plats.length} plataformas, ${fmtNum(unicos)} títulos únicos`);
  return { paginas, plataformas: plats.length, unicos };
}
