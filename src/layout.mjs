// Moldura HTML das páginas: cabeçalho com versão, navegação entre semanas e rodapé com créditos.

import { esc, VERSAO, SITE } from '../scripts/util.mjs';
import { REDES } from './redes.mjs';
import { sitePlataforma } from './plataformas.mjs';
import { seletorTemas } from './temas.mjs';

// Plataformas citadas no rodapé (o link vem de plataformas.mjs).
const PLATAFORMAS_RODAPE = ['Netflix', 'Amazon Prime Video', 'Disney Plus', 'HBO Max', 'Apple TV', 'Globoplay', 'Paramount Plus', 'Telecine', 'Mercado Play', 'Crunchyroll', 'Claro video', 'Pluto TV']
  .map((n) => [n === 'Disney Plus' ? 'Disney+' : n === 'Paramount Plus' ? 'Paramount+' : n, sitePlataforma(n)]).filter(([, h]) => h);

/**
 * Links e arquivos do próprio site saem relativos ("../assets/app.js"), para a página funcionar também
 * aberta direto do disco (file://), onde "/assets/..." apontaria para a raiz da unidade e perderia
 * estilo e botões. A 404 fica absoluta: o servidor a entrega em qualquer profundidade de caminho.
 */
function relativos(html, caminho) {
  if (caminho === '/404.html') return html;
  const pref = '../'.repeat(Math.max(0, caminho.split('/').length - 2));
  return html.replace(/(href|src)="\/(?!\/)([^"]*)"/g, (_m, atr, resto) => `${atr}="${pref}${resto === '' ? 'index.html' : resto}"`);
}

/**
 * `semana` (slug) ou `catalogo` (página dentro de /catalogo/, '' = índice) dizem ao seletor de temas qual
 * é a mesma página nos outros temas. `tema` ≠ padrao: a mesma página no visual do tema (skin
 * /<tema>/catalogo.css), com `canonico` apontando para a página do Padrão e sem indexação.
 */
export function pagina({ titulo, descricao, caminho, corpo, json = null, scripts = [], semana = null, catalogo = null, tema = 'padrao', canonico = null }) {
  const url = SITE + (canonico || caminho);
  const pre = tema === 'padrao' ? '' : `/${tema}`;
  const ref = semana || (catalogo != null ? { catalogo } : null);
  return relativos(`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Streaming Radar">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:url" content="${esc(url)}">
<meta name="twitter:card" content="summary">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/estilo.css?v=${VERSAO}">
${tema === 'padrao' ? '' : `<meta name="robots" content="noindex, nofollow">\n<link rel="stylesheet" href="/${tema}/catalogo.css?v=${VERSAO}">\n`}${json ? `<script type="application/ld+json">${JSON.stringify(json).replace(/</g, '\\u003c')}</script>\n` : ''}</head>
<body${tema === 'padrao' ? '' : ` class="skin-${tema}"`}${semana ? ` data-semana="${esc(semana)}"` : ''}${catalogo != null ? ' data-catalogo' : ''}>
<header class="topo">
  <a class="marca" href="${pre}/"><span class="radar" aria-hidden="true"></span>Streaming Radar</a>
  <nav class="menu" aria-label="Principal"><a href="${pre}/">Semana</a><a href="${pre}/catalogo/">Catálogo</a></nav>
  ${seletorTemas(tema, ref)}
  <span class="versao">v${VERSAO}</span>
</header>
<main data-vista="junto">
${corpo}
</main>
<footer class="rodape">
  <div class="rodape-colunas">
    <section>
      <h2>Fontes dos dados</h2>
      <ul>
        <li><a href="https://www.themoviedb.org/" rel="noopener">TMDB</a>: títulos, datas de estreia no Brasil, elenco, pôsteres e sinopses.</li>
        <li><a href="https://www.justwatch.com/br" rel="noopener">JustWatch</a>: onde assistir (disponibilidade por plataforma, via TMDB).</li>
        <li><a href="https://www.omdbapi.com/" rel="noopener">OMDb API</a>: notas do <a href="https://www.imdb.com/" rel="noopener">IMDb</a>, do <a href="https://www.rottentomatoes.com/" rel="noopener">Rotten Tomatoes</a> e do <a href="https://www.metacritic.com/" rel="noopener">Metacritic</a>, quando disponíveis.</li>
        <li>Mais críticas em português: <a href="https://www.adorocinema.com/filmes/melhores/" rel="noopener">AdoroCinema</a>.</li>
      </ul>
    </section>
    <section>
      <h2>Redes de cinema</h2>
      <ul class="rodape-links">${REDES.map((r) => `<li><a href="${r.cartaz}" rel="noopener">${r.nome}</a></li>`).join('')}</ul>
      <h2>Plataformas</h2>
      <ul class="rodape-links">${PLATAFORMAS_RODAPE.map(([n, href]) => `<li><a href="${href}" rel="noopener">${n}</a></li>`).join('')}</ul>
    </section>
  </div>
  <p>Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB. Marcas e logotipos pertencem aos seus donos.</p>
  <p>Datas e catálogos mudam sem aviso: confira no link da plataforma ou da rede antes de sair de casa. Site gerado de forma autônoma todo dia.
  Código aberto sob a <a href="https://github.com/RicardoBiazin/StreamingRadar/blob/main/LICENSE" rel="noopener">licença MIT</a>:
  <a href="https://github.com/RicardoBiazin/StreamingRadar" rel="noopener">GitHub</a>. v${VERSAO}.</p>
</footer>
<script src="/assets/tema.js?v=${VERSAO}" defer></script>
<script src="/assets/app.js?v=${VERSAO}" defer></script>
<script src="/assets/detalhe.js?v=${VERSAO}" defer></script>
${scripts.map((s) => `<script src="${s}?v=${VERSAO}" defer></script>`).join('\n')}
</body>
</html>
`, caminho);
}
