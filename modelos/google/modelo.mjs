// Modelo "google": resultados de busca com Material Design 3 e painel "Onde assistir".
// Topo com marca em letras coloridas e caixa de busca, abas Tudo / Cinema / Filmes / Séries,
// chips de gênero e plataforma, lista de resultados com miniatura e painel lateral da semana.

import { esc, head, creditos } from '../_base.mjs';

export const meta = {
  nome: 'Resultados de busca',
  inspiracao: 'Google (Material Design 3, resultados de busca e painel "Onde assistir")',
  descricao: 'Lista no estilo da busca do Google: abas, chips de filtro, miniatura do pôster, título azul, linha verde e painel "Onde assistir" em cada item.',
};

const ID = 'google';
const CORES = ['azul', 'vermelho', 'amarelo', 'azul', 'verde', 'vermelho'];

const ICONES = {
  busca: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
  estrela: '<path d="M12 3.5l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1-5.4-3-5.4 3 1.1-6.1-4.5-4.3 6.1-.8z"/>',
  play: '<path d="M8 5.5v13l11-6.5z"/>',
  fora: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  esq: '<path d="M15 5l-7 7 7 7"/>',
  dir: '<path d="M9 5l7 7-7 7"/>',
  cinema: '<path d="M4 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1a2 2 0 0 1 0-4v0a2 2 0 0 0 0-4V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1z"/><path d="M14 6v12" stroke-dasharray="2 2.5"/>',
  tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
};
const ico = (n, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONES[n]}</svg>`;

const ROTULOS = { cinema: 'Cinema', filme: 'Filmes no streaming', serie: 'Séries' };
const ABREV = { cinema: 'C', filme: 'F', serie: 'S' };

function marca() {
  let k = 0;
  const letras = [...'Streaming'].map((c) => `<span class="c-${CORES[k++ % CORES.length]}">${c}</span>`).join('');
  const radar = [...'Radar'].map((c) => `<span class="c-${CORES[k++ % CORES.length]}">${c}</span>`).join('');
  return `<a class="marca" href="#resultados" aria-label="Streaming Radar"><span aria-hidden="true">${letras}</span><span class="marca-esp" aria-hidden="true"> </span><span aria-hidden="true" class="marca-2">${radar}</span></a>`;
}

function onde(i) {
  if (i.tipo === 'cinema') {
    return `<div class="onde" aria-labelledby="o-${esc(i.id)}">
        <h4 id="o-${esc(i.id)}">${ico('cinema')}Onde assistir <span>Programação nas redes</span></h4>
        <ul class="pilulas">${i.redes.map((r) => `<li><a class="pil" href="${esc(r.href)}" rel="noopener">${esc(r.nome)}</a></li>`).join('')}</ul>
      </div>`;
  }
  let corpo;
  if (i.semPlataforma) {
    corpo = '<p class="vazio">Plataforma ainda não informada</p>';
  } else {
    corpo = `<ul class="pilulas">${i.plataformas.map((p) => `<li><a class="pil plat" href="${esc(p.href)}" rel="noopener">${p.logo ? `<img src="${esc(p.logo)}" alt="" width="22" height="22" loading="lazy">` : '<span class="plat-pt" aria-hidden="true"></span>'}${esc(p.nome)}${p.tipo !== 'assinatura' ? `<small>${esc(p.tipo)}</small>` : ''}</a></li>`).join('')}</ul>`;
  }
  const extra = i.tipo === 'serie'
    ? `<p class="onde-linha">${i.estreiaTxt ? `<strong>${esc(i.estreiaTxt)}</strong>` : ''}${i.canais.length ? ` · Canais: ${esc(i.canais.join(', '))}` : ''}</p>`
    : '';
  return `<div class="onde" aria-labelledby="o-${esc(i.id)}">
        <h4 id="o-${esc(i.id)}">${ico('tv')}Onde assistir</h4>
        ${corpo}
        ${extra}
      </div>`;
}

function selos(i) {
  if (!i.selos) return '';
  const s = i.selos;
  const l = [];
  if (s.imdb) l.push(`<a class="selo" href="${esc(s.imdb.href)}" rel="noopener">IMDb <b>${esc(s.imdb.txt)}</b></a>`);
  if (s.rt) l.push(`<a class="selo" href="${esc(s.rt.href)}" rel="noopener">Rotten Tomatoes <b>${esc(s.rt.txt)}</b></a>`);
  if (s.mc) l.push(`<a class="selo" href="${esc(s.mc.href)}" rel="noopener">Metacritic <b>${esc(s.mc.txt)}</b></a>`);
  return l.length ? `<p class="selos">${l.join('')}</p>` : '';
}

function resultado(i, n) {
  const tom = CORES[n % CORES.length];
  const plat = i.tipo === 'cinema' ? '' : i.plataformas.map((p) => p.nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).join(' ');
  const gen = i.generosSlug.join(' ');
  const linhaMeta = [
    i.generos.length ? esc(i.generos.join(', ')) : '',
    i.duracao ? `${esc(i.duracao)} min` : '',
    i.classificacao ? `Classificação ${esc(i.classificacao)}` : '',
  ].filter(Boolean).join(' · ');
  const curta = i.sinopseCurta;
  const longa = i.sinopse && i.sinopse.length > curta.length ? `<details class="mais"><summary>Ler sinopse completa</summary><p>${esc(i.sinopse)}</p></details>` : '';
  const links = [
    `<a href="${esc(i.tmdbUrl)}" rel="noopener">${ico('fora')}TMDB</a>`,
    i.trailerUrl ? `<a href="${esc(i.trailerUrl)}" rel="noopener">${ico('play')}Trailer</a>` : '',
    i.justwatchUrl ? `<a href="${esc(i.justwatchUrl)}" rel="noopener">${ico('fora')}JustWatch</a>` : '',
  ].filter(Boolean).join('');
  const poster = i.poster
    ? `<img src="${esc(i.poster)}" alt="Pôster de ${esc(i.titulo)}" width="342" height="513" loading="lazy">`
    : `<span class="sem-poster b-${tom}" role="img" aria-label="Sem pôster: ${esc(i.titulo)}">${esc(i.inicial)}</span>`;
  return `<li class="res" data-tipo="${esc(i.tipo)}" data-gen="${esc(gen)}" data-plat="${esc(plat)}" data-titulo="${esc((i.titulo + ' ' + (i.original || '')).toLowerCase())}">
    <article class="res-in" aria-labelledby="t-${esc(i.id)}">
      <div class="res-txt">
        <p class="url"><span class="fav b-${tom}" aria-hidden="true">${ABREV[i.tipo]}</span><span class="url-txt">Streaming Radar › ${esc(i.tipoRotulo)} › <time datetime="${esc(i.data)}">${esc(i.dataLonga)}</time></span></p>
        <h3 class="res-tit" id="t-${esc(i.id)}"><a href="${esc(i.tmdbUrl)}" rel="noopener">${esc(i.titulo)}</a></h3>
        ${i.original && i.original !== i.titulo ? `<p class="orig">Título original: <i>${esc(i.original)}</i></p>` : ''}
        <p class="meta">${i.notaTxt ? `<span class="nota">${ico('estrela')}${esc(i.notaTxt)}<small>TMDB</small></span>` : ''}${linhaMeta}</p>
        ${curta ? `<p class="sin">${esc(curta)}</p>${longa}` : '<p class="sin vazio">Sem sinopse disponível.</p>'}
        ${selos(i)}
        ${onde(i)}
        <p class="links">${links}</p>
      </div>
      <div class="thumb">${poster}</div>
    </article>
  </li>`;
}

export function render(d) {
  const s = d.semana;
  let n = 0;
  const secao = (tipo, id, lista) => `<section class="sec" id="${id}" data-tipo="${tipo}" aria-labelledby="h-${id}">
    <h2 id="h-${id}">${ROTULOS[tipo]} <span class="sec-n" data-conta="${tipo}">${lista.length}</span></h2>
    <ol class="lista">
    ${lista.map((i) => resultado(i, n++)).join('\n    ')}
    </ol>
  </section>`;

  const chipsGen = d.generos.map((g) => `<button type="button" class="chip" data-gen="${esc(g.slug)}" aria-pressed="false">${esc(g.nome)}<span>${g.qtd}</span></button>`).join('');
  const chipsPlat = d.plataformas.map((p) => `<button type="button" class="chip" data-plat="${esc(p.slug)}" aria-pressed="false">${esc(p.nome)}<span>${p.qtd}</span></button>`).join('');

  const nav = (alvo, rot, dir) => alvo
    ? `<a class="bt tonal" href="${esc(alvo.url)}">${dir === 'esq' ? ico('esq') : ''}${esc(rot)}: ${esc(alvo.faixa)}${dir === 'dir' ? ico('dir') : ''}</a>`
    : '';

  return `<!doctype html>
<html lang="pt-BR">
${head(ID, d, { titulo: `Streaming Radar · ${s.faixa}`, extra: `<script src="/${ID}/filtro.js" defer></script>\n` })}
<body>
<a class="pular" href="#resultados">Pular para os resultados</a>
<header class="topo">
  <div class="topo-in">
    ${marca()}
    <div class="busca" role="search">
      <label class="sr" for="q">Buscar título nesta semana</label>
      ${ico('busca', 'ico busca-ico')}
      <input id="q" type="search" placeholder="Buscar título nesta semana" autocomplete="off" spellcheck="false">
    </div>
    <nav class="links-topo" aria-label="Site oficial">
      <a href="${esc(d.site)}">Semana</a>
      <a href="${esc(d.catalogo.url)}">Catálogo</a>
      <span class="versao">v${esc(d.versao)}</span>
    </nav>
  </div>
  <nav class="abas" aria-label="Tipo de resultado">
    <a href="#resultados" data-aba="tudo" aria-current="page">Tudo<span>${d.totais.itens}</span></a>
    <a href="#cinema" data-aba="cinema">Cinema<span>${d.totais.cinema}</span></a>
    <a href="#filmes" data-aba="filme">Filmes<span>${d.totais.filmes}</span></a>
    <a href="#series" data-aba="serie">Séries<span>${d.totais.series}</span></a>
  </nav>
</header>

<div class="pagina">
<main class="col" id="resultados">
  <div class="semana-topo">
    <p class="sobre">Semana ${esc(s.numero)} de ${esc(s.ano)}</p>
    <h1>Lançamentos de ${esc(s.faixa)}</h1>
    <p class="semana-nav">
      ${nav(d.anterior, 'Anterior', 'esq')}
      ${nav(d.proxima, 'Próxima', 'dir')}
      <a class="bt texto" href="#semanas">Todas as semanas</a>
    </p>
  </div>

  <div class="filtros" aria-label="Filtros">
    <div class="fileira" role="group" aria-label="Gêneros">
      <span class="fileira-rot">Gêneros</span>
      <div class="chips">${chipsGen}</div>
    </div>
    <div class="fileira" role="group" aria-label="Plataformas">
      <span class="fileira-rot">Plataformas</span>
      <div class="chips">${chipsPlat}</div>
    </div>
  </div>
  <p class="stats" role="status" aria-live="polite"><span id="stats">${d.totais.itens} resultados</span> <button type="button" class="limpar" hidden>Limpar filtros</button></p>

  ${secao('cinema', 'cinema', s.cinema)}
  ${secao('filme', 'filmes', s.filmes)}
  ${secao('serie', 'series', s.series)}
  <p class="nada" hidden>Nenhum resultado para esses filtros. Tente outra combinação.</p>
</main>

<aside class="lado" aria-label="Painel da semana">
  <section class="painel">
    <h2>Esta semana</h2>
    <p class="painel-faixa">${ico('cal')}${esc(s.faixa)}</p>
    <ul class="contagem">
      <li><a href="#cinema"><b class="n-vermelho">${d.totais.cinema}</b> em cartaz no cinema</a></li>
      <li><a href="#filmes"><b class="n-azul">${d.totais.filmes}</b> filmes no streaming</a></li>
      <li><a href="#series"><b class="n-verde">${d.totais.series}</b> séries</a></li>
    </ul>
    <p class="painel-links"><a class="bt cheio" href="${esc(d.site)}">Site oficial</a><a class="bt contorno" href="${esc(d.catalogo.url)}">Catálogo${d.catalogo.titulos ? ` (${d.catalogo.titulos} títulos)` : ''}</a></p>
  </section>
  <section class="painel" id="semanas">
    <h2>Todas as semanas</h2>
    <ul class="semanas">
      ${d.semanas.map((w) => `<li><a href="${esc(w.url)}"${w.slug === s.slug ? ' aria-current="page"' : ''}>${esc(w.faixa)}</a></li>`).join('\n      ')}
    </ul>
  </section>
</aside>
</div>

<footer class="rodape">
  ${creditos(d)}
  <p class="rodape-extra">${esc(d.creditos.justwatch)}</p>
</footer>
</body>
</html>
`;
}
