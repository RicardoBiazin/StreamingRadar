// Moldura HTML das páginas: cabeçalho com versão, navegação entre semanas e rodapé com créditos.

import { esc, VERSAO, SITE } from '../scripts/util.mjs';

export function pagina({ titulo, descricao, caminho, corpo, json = null }) {
  const url = SITE + caminho;
  return `<!doctype html>
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
  <span class="versao">v${VERSAO}</span>
</header>
<main data-vista="junto">
${corpo}
</main>
<footer class="rodape">
  <p>Gerado de forma autônoma todo dia a partir do <a href="https://www.themoviedb.org/" rel="noopener">TMDB</a>.
  Onde assistir: dados do <a href="https://www.justwatch.com/br" rel="noopener">JustWatch</a>.
  Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.</p>
  <p>Datas e catálogos mudam sem aviso: confira no link da plataforma ou da rede antes de sair de casa.
  Código aberto: <a href="https://github.com/RicardoBiazin/StreamingRadar" rel="noopener">GitHub</a>. v${VERSAO}.</p>
</footer>
<script src="/assets/app.js" defer></script>
</body>
</html>
`;
}
