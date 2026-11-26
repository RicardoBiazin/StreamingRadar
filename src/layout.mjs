// Moldura HTML das páginas: cabeçalho com versão, navegação entre semanas e rodapé com créditos.

import { esc, VERSAO, SITE } from '../scripts/util.mjs';

/**
 * Links e arquivos do próprio site saem relativos ("../assets/app.js"), para a página funcionar também
 * aberta direto do disco (file://), onde "/assets/..." apontaria para a raiz da unidade e perderia
 * estilo e botões. A 404 fica absoluta: o servidor a entrega em qualquer profundidade de caminho.
 */
function relativos(html, caminho) {
  if (caminho === '/404.html') return html;
  const pref = caminho.split('/').length > 2 ? '../' : '';
  return html.replace(/(href|src)="\/(?!\/)([^"]*)"/g, (_m, atr, resto) => `${atr}="${pref}${resto === '' ? 'index.html' : resto}"`);
}

export function pagina({ titulo, descricao, caminho, corpo, json = null, scripts = [] }) {
  const url = SITE + caminho;
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
<link rel="stylesheet" href="/assets/estilo.css">
${json ? `<script type="application/ld+json">${JSON.stringify(json).replace(/</g, '\\u003c')}</script>\n` : ''}</head>
<body>
<header class="topo">
  <a class="marca" href="/"><span class="radar" aria-hidden="true"></span>Streaming Radar</a>
  <nav class="menu" aria-label="Principal"><a href="/">Semana</a><a href="/catalogo/">Catálogo</a></nav>
  <span class="versao">v${VERSAO}</span>
</header>
<main data-vista="junto">
${corpo}
</main>
<footer class="rodape">
  <p>Gerado de forma autônoma todo dia a partir do <a href="https://www.themoviedb.org/" rel="noopener">TMDB</a>.
  Onde assistir: dados do <a href="https://www.justwatch.com/br" rel="noopener">JustWatch</a>.
  Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.
  Notas do IMDb, Rotten Tomatoes e Metacritic via <a href="https://www.omdbapi.com/" rel="noopener">OMDb API</a>, quando disponíveis.</p>
  <p>Datas e catálogos mudam sem aviso: confira no link da plataforma ou da rede antes de sair de casa.
  Código aberto: <a href="https://github.com/RicardoBiazin/StreamingRadar" rel="noopener">GitHub</a>. v${VERSAO}.</p>
</footer>
<script src="/assets/app.js" defer></script>
<script src="/assets/detalhe.js" defer></script>
${scripts.map((s) => `<script src="${s}" defer></script>`).join('\n')}
</body>
</html>
`, caminho);
}
