// Modelo "linkedin": a semana como uma rede profissional.
// Três colunas: cartão de perfil + filtros, feed de publicações (cada lançamento é um post) e
// "Outras semanas" + créditos. No celular vira coluna única com barra de navegação inferior.
// Ícones, capa e avatar são desenhados aqui (nada copiado do site de referência).

import { esc, head, creditos } from '../_base.mjs';

export const meta = {
  nome: 'Feed profissional',
  inspiracao: 'LinkedIn (linkedin.com)',
  descricao: 'Três colunas: perfil e filtros à esquerda, lançamentos como publicações no feed e outras semanas à direita, com botões em pílula e acento azul.',
};

const ID = 'linkedin';

// Ícones de traço (viewBox 24), tudo próprio.
const PATHS = {
  radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12l6.5-6.5"/>',
  clap: '<rect x="3" y="9" width="18" height="11" rx="2"/><path d="M3 9l2.5-5 4 1-2.5 4M9.5 5l4 1-2.5 4M13.5 6l4 1-2.5 4M17.5 7L21 8l-1 1"/>',
  filme: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 3v18M16 3v18M4 8h4M4 12h4M4 16h4M16 8h4M16 12h4M16 16h4"/>',
  tv: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 3l4 3 4-3M9 21h6"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  olho: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  casa: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
  grade: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  esq: '<path d="M15 5l-7 7 7 7"/>',
  dir: '<path d="M9 5l7 7-7 7"/>',
  estrela: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8z"/>',
  filtro: '<path d="M4 6h16M7 12h10M10 18h4"/>',
};
const ico = (n, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${PATHS[n]}</svg>`;

const duracao = (m) => (m ? (m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}` : `${m} min`) : null);
const classif = (c) => (c ? (c === 'L' ? 'Livre' : /^\d+$/.test(c) ? `${c} anos` : c) : null);

function tipoIco(t) { return t === 'cinema' ? 'clap' : t === 'serie' ? 'tv' : 'filme'; }

function post(i, slugPlat) {
  const prim = i.plataformas[0];
  const nomeTopo = i.tipo === 'cinema' ? 'Cinema'
    : prim ? esc(prim.nome) + (i.plataformas.length > 1 ? ` e mais ${i.plataformas.length - 1}` : '')
      : 'Streaming';
  const av = prim && prim.logo
    ? `<span class="av av-logo"><img src="${esc(prim.logo)}" alt="" width="48" height="48" loading="lazy"></span>`
    : `<span class="av av-${i.tipo}">${ico(tipoIco(i.tipo))}</span>`;
  const plats = i.plataformas.map((p) => slugPlat.get(p.nome)).filter(Boolean).join(' ');
  const meta = [
    i.notaTxt ? `<span class="nota" title="Nota no TMDB">${ico('estrela')}${esc(i.notaTxt)} <small>TMDB</small></span>` : '',
    i.duracao ? `<span>${esc(duracao(i.duracao))}</span>` : '',
    i.classificacao ? `<span>${esc(classif(i.classificacao))}</span>` : '',
  ].filter(Boolean).join('');
  const selos = i.selos ? [
    i.selos.imdb ? `<a class="selo-c" href="${esc(i.selos.imdb.href)}" rel="noopener">IMDb ${esc(i.selos.imdb.txt)}</a>` : '',
    i.selos.rt ? `<a class="selo-c" href="${esc(i.selos.rt.href)}" rel="noopener">Rotten Tomatoes ${esc(i.selos.rt.txt)}</a>` : '',
    i.selos.mc ? `<a class="selo-c" href="${esc(i.selos.mc.href)}" rel="noopener">Metacritic ${esc(i.selos.mc.txt)}</a>` : '',
  ].filter(Boolean).join('') : '';

  let onde = '';
  if (i.tipo === 'cinema') {
    onde = `<div class="onde"><p class="onde-rot">Programação nas redes</p><div class="botoes">${i.redes.map((r) => `<a class="pilula contorno peq" href="${esc(r.href)}" rel="noopener">${esc(r.nome)}</a>`).join('')}</div></div>`;
  } else if (i.semPlataforma) {
    onde = `<div class="onde"><p class="onde-rot">Onde assistir</p><p class="sem-plat">Plataforma ainda não informada</p></div>`;
  } else {
    onde = `<div class="onde"><p class="onde-rot">Onde assistir</p><ul class="plats">${i.plataformas.map((p) => `<li><a class="chip-plat" href="${esc(p.href)}" rel="noopener">${p.logo ? `<img src="${esc(p.logo)}" alt="" width="20" height="20" loading="lazy">` : ''}${esc(p.nome)}${p.tipo !== 'assinatura' ? ` <small>${esc(p.tipo)}</small>` : ''}</a></li>`).join('')}</ul></div>`;
  }
  const canais = i.tipo === 'serie' && i.canais.length ? `<p class="canais">Canais: ${esc(i.canais.join(', '))}</p>` : '';

  const midia = i.poster
    ? `<div class="midia"><img class="m-blur" src="${esc(i.poster)}" alt="" aria-hidden="true" loading="lazy"><img class="m-poster" src="${esc(i.poster)}" alt="Pôster de ${esc(i.titulo)}" width="240" height="360" loading="lazy"></div>`
    : `<div class="midia sem"><span class="m-inicial" aria-hidden="true">${esc(i.inicial)}</span><span class="m-sem">Sem pôster</span></div>`;

  return `<article class="post cartao" id="p-${esc(i.id)}" data-tipo="${i.tipo}" data-gen="${esc(i.generosSlug.join(' '))}" data-plat="${esc(plats)}">
  <header class="post-topo">
    ${av}
    <div class="post-quem">
      <p class="quem">${nomeTopo}</p>
      <p class="sub">${i.tipo === 'cinema' ? 'Lançamento nos cinemas' : esc(i.tipoRotulo)}${i.estreiaTxt ? ` · ${esc(i.estreiaTxt)}` : ''}</p>
      <p class="sub"><time datetime="${esc(i.data)}">Estreia em ${esc(i.dataMini)}</time> ${ico('cal', 'ico mini-i')}</p>
    </div>
  </header>
  <div class="post-texto">
    <h3 class="titulo">${esc(i.titulo)}</h3>
    ${i.original && i.original !== i.titulo ? `<p class="original">${esc(i.original)}</p>` : ''}
    ${meta ? `<p class="meta">${meta}</p>` : ''}
    <p class="sinopse">${esc(i.sinopse || 'Sinopse ainda não disponível.')}</p>
    <p class="hashes">${i.generos.map((g, k) => `<span class="hash" data-gen="${esc(i.generosSlug[k])}">#${esc(g)}</span>`).join(' ')}</p>
  </div>
  ${midia}
  ${onde}${canais}
  ${selos ? `<div class="selos-c">${selos}</div>` : ''}
  <div class="acoes">
    <a class="pilula neutra" href="${esc(i.tmdbUrl)}" rel="noopener">${ico('info')}TMDB</a>
    ${i.trailerUrl ? `<a class="pilula neutra" href="${esc(i.trailerUrl)}" rel="noopener">${ico('play')}Trailer</a>` : ''}
    ${i.justwatchUrl ? `<a class="pilula neutra" href="${esc(i.justwatchUrl)}" rel="noopener">${ico('olho')}JustWatch</a>` : ''}
  </div>
</article>`;
}

const MARCA = `<svg class="marca-svg" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect width="40" height="40" rx="8" class="m-fundo"/><g fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><circle cx="20" cy="20" r="11"/><circle cx="20" cy="20" r="5.5" stroke-opacity=".7"/><path d="M20 20l8-8"/></g><circle cx="27" cy="13" r="2.6" fill="#fff"/></svg>`;

export function render(d) {
  const s = d.semana;
  const slugPlat = new Map(d.plataformas.map((p) => [p.nome, p.slug]));
  const logoPlat = new Map();
  for (const i of s.itens) for (const p of i.plataformas) if (p.logo && !logoPlat.has(p.nome)) logoPlat.set(p.nome, p.logo);

  const secao = (id, rot, icone, lista, txt) => `<section class="secao" id="${id}" data-tipo="${id === 'filmes' ? 'filme' : id === 'series' ? 'serie' : 'cinema'}" aria-labelledby="h-${id}">
  <div class="secao-topo"><h2 id="h-${id}">${ico(icone)}${rot} <span class="qtd" data-total="${lista.length}">${lista.length}</span></h2><p>${txt}</p></div>
  ${lista.map((i) => post(i, slugPlat)).join('\n')}
</section>`;

  const titulo = `Semana ${s.numero} · ${s.faixa} · Streaming Radar`;
  const anterior = d.anterior ? `<a class="pilula contorno peq" href="${esc(d.anterior.url)}">${ico('esq')}${esc(d.anterior.faixa)}</a>` : '';
  const proxima = d.proxima ? `<a class="pilula contorno peq" href="${esc(d.proxima.url)}">${esc(d.proxima.faixa)}${ico('dir')}</a>` : '';

  return `<!doctype html>
<html lang="pt-BR">
${head(ID, d, { titulo, extra: `<meta name="color-scheme" content="light dark">\n<script src="/${ID}/filtro.js" defer></script>\n` })}
<body id="topo">
<a class="pular" href="#feed">Pular para o feed</a>

<header class="nav">
  <div class="nav-in">
    <a class="marca" href="${esc(d.site)}" aria-label="Streaming Radar, site oficial">${MARCA}<span class="marca-txt"><strong>Streaming Radar</strong><span>v${esc(d.versao)} · modelo de layout</span></span></a>
    <nav aria-label="Principal">
      <a href="${esc(d.site)}">${ico('casa')}<span>Semana</span></a>
      <a href="${esc(d.catalogo.url)}">${ico('grade')}<span>Catálogo</span></a>
      <a href="#semanas">${ico('cal')}<span>Semanas</span></a>
    </nav>
  </div>
</header>

<div class="pagina">

  <aside class="esq" aria-label="Perfil e filtros">
    <section class="cartao perfil" aria-labelledby="h-semana">
      <div class="capa" aria-hidden="true"></div>
      <div class="perfil-corpo">
        <span class="avatar">${MARCA}</span>
        <p class="perfil-nome">Streaming Radar</p>
        <h1 id="h-semana">Semana ${esc(s.numero)} de ${esc(s.ano)}</h1>
        <p class="perfil-faixa">${esc(s.faixa)}</p>
        <ul class="stats" aria-label="Lançamentos da semana">
          <li><a href="#cinema"><span>Cinema</span><strong>${d.totais.cinema}</strong></a></li>
          <li><a href="#filmes"><span>Filmes</span><strong>${d.totais.filmes}</strong></a></li>
          <li><a href="#series"><span>Séries</span><strong>${d.totais.series}</strong></a></li>
        </ul>
        <div class="semana-nav">${anterior}${proxima}</div>
      </div>
    </section>

    <details class="cartao filtros" open id="filtros">
      <summary>${ico('filtro')}Filtrar lançamentos</summary>
      <div class="so-js">
        <h2 class="f-tit">Gêneros</h2>
        <div class="chips" data-grupo="gen">
          ${d.generos.map((g) => `<button type="button" class="chip" data-gen="${esc(g.slug)}" aria-pressed="false">${esc(g.nome)} <small>${g.qtd}</small></button>`).join('\n          ')}
        </div>
        <h2 class="f-tit">Plataformas</h2>
        <div class="chips" data-grupo="plat">
          ${d.plataformas.map((p) => `<button type="button" class="chip" data-plat="${esc(p.slug)}" aria-pressed="false">${logoPlat.get(p.nome) ? `<img src="${esc(logoPlat.get(p.nome))}" alt="" width="16" height="16" loading="lazy">` : ''}${esc(p.nome)} <small>${p.qtd}</small></button>`).join('\n          ')}
        </div>
        <button type="button" class="pilula neutra peq limpar" hidden>Limpar filtros</button>
      </div>
      <p class="sem-js">Os filtros precisam de JavaScript. Sem ele, todos os ${d.totais.itens} lançamentos aparecem no feed.</p>
    </details>
  </aside>

  <main class="centro" id="feed">
    <section class="cartao topo-feed" aria-label="Resumo da semana">
      <div class="topo-feed-l">
        <span class="avatar peq">${MARCA}</span>
        <p><strong>Semana ${esc(s.numero)}</strong><br><span>${esc(s.faixa)} · <span id="resumo" aria-live="polite">${d.totais.itens} lançamentos</span></span></p>
      </div>
      <div class="abas" role="group" aria-label="Tipo de lançamento">
        <a class="aba" href="#feed" data-tipo="tudo" aria-current="true">Tudo <small>${d.totais.itens}</small></a>
        <a class="aba" href="#cinema" data-tipo="cinema">Cinema <small>${d.totais.cinema}</small></a>
        <a class="aba" href="#filmes" data-tipo="filme">Filmes <small>${d.totais.filmes}</small></a>
        <a class="aba" href="#series" data-tipo="serie">Séries <small>${d.totais.series}</small></a>
      </div>
    </section>

    ${secao('cinema', 'Cinema', 'clap', s.cinema, 'Estreias nas telas da semana, com a programação das redes.')}
    ${secao('filmes', 'Filmes no streaming', 'filme', s.filmes, 'Filmes que chegam às plataformas.')}
    ${secao('series', 'Séries', 'tv', s.series, 'Séries e temporadas novas.')}

    <p class="vazio cartao" id="vazio" hidden>Nenhum lançamento com esses filtros. <button type="button" class="pilula contorno peq" id="vazio-limpar">Limpar filtros</button></p>
  </main>

  <aside class="dir" aria-label="Outras semanas e créditos">
    <section class="cartao mini" id="semanas" aria-labelledby="h-outras">
      <h2 id="h-outras">Outras semanas</h2>
      <ul class="semanas-lista">
        ${d.semanas.map((w) => {
    const atual = w.slug === s.slug;
    return `<li><a href="${esc(atual ? d.site : w.url)}"${atual ? ' aria-current="page" class="atual"' : ''}><span class="sem-n">S${esc(w.slug.split('-w')[1])}</span><span>${esc(w.faixa)}</span>${atual ? '<small>esta semana</small>' : ''}</a></li>`;
  }).join('\n        ')}
      </ul>
      <p class="semana-nav">${anterior}${proxima}</p>
    </section>

    <section class="cartao mini">
      <h2>Catálogo</h2>
      <p class="fraco">${d.catalogo.titulos ? `${d.catalogo.titulos} títulos` : 'Títulos'}${d.catalogo.plataformas ? ` em ${d.catalogo.plataformas} plataformas` : ''}, sempre atualizados.</p>
      <a class="pilula cheia peq bloco" href="${esc(d.catalogo.url)}">Abrir o catálogo</a>
    </section>

    <footer class="cartao mini rodape">
      <h2>Créditos</h2>
      ${creditos(d)}
      <p class="creditos-jw">${esc(d.creditos.justwatch)}</p>
    </footer>
  </aside>
</div>

<nav class="nav-inf" aria-label="Seções">
  <a href="#topo">${ico('casa')}<span>Início</span></a>
  <a href="#cinema">${ico('clap')}<span>Cinema</span></a>
  <a href="#filmes">${ico('filme')}<span>Filmes</span></a>
  <a href="#series">${ico('tv')}<span>Séries</span></a>
  <a href="#semanas">${ico('cal')}<span>Semanas</span></a>
</nav>
</body>
</html>
`;
}
