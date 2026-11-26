// Modelo "lens": fundo branco com linhas radiais, mascote-lente sorridente e cartões pastel grandes.
import { esc, head, creditos } from '../_base.mjs';

export const meta = {
  nome: 'Lente amigável',
  inspiracao: 'Lens',
  descricao: 'Fundo branco com linhas radiais suaves, mascote-lente sorridente e um cartão pastel grande por lançamento, com o pôster saindo do cartão.',
};

const ID = 'lens';
const TONS = ['lilas', 'pessego', 'menta', 'ceu'];

// Ícones simples por gênero (traço, viewBox 24). Cada um vira um <symbol>.
const ICONES = {
  drama: '<path d="M5 5h14v7a7 7 0 0 1-14 0z"/><path d="M9 10v1M15 10v1M9 16c1.5-1.5 4.5-1.5 6 0"/>',
  comedia: '<circle cx="12" cy="12" r="9"/><path d="M9 10v1M15 10v1M8 14.5c1.2 2.5 6.8 2.5 8 0"/>',
  documentario: '<rect x="3" y="7" width="13" height="10" rx="2.5"/><path d="M16 11l5-3v8l-5-3z"/>',
  romance: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  crime: '<circle cx="10" cy="10" r="6"/><path d="M15 15l5.5 5.5"/>',
  reality: '<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M9 3l3 4 3-4"/>',
  animacao: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6-4.5-4.1 6-.7z"/>',
  familia: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M10 20v-5h4v5"/>',
  musica: '<path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
  fantasia: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
  thriller: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  acao: '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-9z"/>',
  ficcao: '<circle cx="12" cy="12" r="5"/><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(-25 12 12)"/>',
  historia: '<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',
  misterio: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17v.5"/>',
  aventura: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  filmes: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M3 15h18M8 4v16M16 4v16"/>',
  faroeste: '<path d="M10 21V6a2 2 0 0 1 4 0v15M10 15H7a2 2 0 0 1-2-2V9M14 12h3a2 2 0 0 0 2-2V7M8 21h8"/>',
  guerra: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  kids: '<ellipse cx="12" cy="9.5" rx="6" ry="7"/><path d="M12 16.5l-1 2h2zM12 18.5c0 2-2 2-2 3.5"/>',
  terror: '<path d="M5 21V11a7 7 0 0 1 14 0v10l-3.5-2-3.5 2-3.5-2z"/><path d="M9.5 11v1M14.5 11v1"/>',
  ingresso: '<path d="M4 8a2 2 0 0 0 0 4v0a2 2 0 0 0 0 4v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1a2 2 0 0 1 0-4v0a2 2 0 0 1 0-4V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1z" transform="translate(0 -1)"/><path d="M14 6v12" stroke-dasharray="2 2.4"/>',
  tela: '<rect x="3" y="4" width="18" height="12" rx="3"/><path d="M10 8.5v3l3-1.5zM8 20h8M12 16v4"/>',
  tv: '<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M9 3l3 4 3-4"/>',
  estrela: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6-4.5-4.1 6-.7z"/>',
  seta: '<path d="M7 17L17 7M9 7h8v8"/>',
  esq: '<path d="M15 5l-7 7 7 7"/>',
  dir: '<path d="M9 5l7 7-7 7"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  play: '<path d="M8 5v14l11-7z"/>',
  calendario: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
};
const ALIAS = { 'sci-fi-fantasy': 'ficcao', 'ficcao-cientifica': 'ficcao', 'cinema-tv': 'filmes' };
const nomeIcone = (slug) => { const k = ALIAS[slug] || slug; return ICONES[k] ? k : 'fantasia'; };

const sprite = `<svg class="sprite" width="0" height="0" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="g-anel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b79cff"/><stop offset="1" stop-color="#7fb8ff"/></linearGradient>
<linearGradient id="g-vidro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1ebff"/><stop offset="1" stop-color="#d4ecff"/></linearGradient>
</defs>
<symbol id="mascote" viewBox="0 0 160 150">
  <rect x="104" y="108" width="22" height="46" rx="11" transform="rotate(-42 115 131)" fill="#ffc59e"/>
  <circle cx="76" cy="72" r="56" fill="url(#g-anel)"/>
  <circle cx="76" cy="72" r="44" fill="url(#g-vidro)"/>
  <path d="M40 52a40 40 0 0 1 22-20" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".85"/>
  <circle cx="76" cy="72" r="30" fill="none" stroke="#c9bdf5" stroke-width="1.5" stroke-dasharray="2 5" stroke-linecap="round"/>
  <ellipse cx="59" cy="68" rx="7.5" ry="9.5" fill="#2e2552"/><ellipse cx="93" cy="68" rx="7.5" ry="9.5" fill="#2e2552"/>
  <circle cx="61.5" cy="64" r="2.8" fill="#fff"/><circle cx="95.5" cy="64" r="2.8" fill="#fff"/>
  <path d="M63 86c4 7 18 7 22 0" fill="none" stroke="#2e2552" stroke-width="4.5" stroke-linecap="round"/>
  <ellipse cx="46" cy="83" rx="8" ry="5" fill="#ffb3c8" opacity=".85"/><ellipse cx="106" cy="83" rx="8" ry="5" fill="#ffb3c8" opacity=".85"/>
  <path d="M130 22l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#ffd36e"/>
  <circle cx="22" cy="30" r="4" fill="#8fdcbc"/>
</symbol>
${Object.entries(ICONES).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${v}</symbol>`).join('\n')}
</svg>`;

const ico = (nome, cls = 'ico') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${nome}"/></svg>`;
const mascote = (cls) => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#mascote"/></svg>`;

function plataformasHtml(i) {
  if (i.semPlataforma) return '<p class="onde onde--vazio">Plataforma ainda não informada</p>';
  return `<ul class="plats" aria-label="Onde assistir">${i.plataformas.map((p) => `<li><a class="plat" href="${esc(p.href)}" rel="noopener">${p.logo ? `<img src="${esc(p.logo)}" alt="" width="22" height="22" loading="lazy">` : ''}<span>${esc(p.nome)}</span></a></li>`).join('')}</ul>`;
}

function selosHtml(i) {
  if (!i.selos) return '';
  const s = [];
  if (i.selos.imdb) s.push(`<a href="${esc(i.selos.imdb.href)}" rel="noopener">IMDb ${esc(i.selos.imdb.txt)}</a>`);
  if (i.selos.rt) s.push(`<a href="${esc(i.selos.rt.href)}" rel="noopener">Tomatometer ${esc(i.selos.rt.txt)}</a>`);
  if (i.selos.mc) s.push(`<a href="${esc(i.selos.mc.href)}" rel="noopener">Metacritic ${esc(i.selos.mc.txt)}</a>`);
  return s.length ? `<p class="selos">${s.join('')}</p>` : '';
}

function cartao(i, n) {
  const tom = TONS[n % TONS.length];
  const gens = i.generos.slice(0, 4);
  const sinopse = i.sinopse
    ? `<div class="sin"><p class="curta">${esc(i.sinopseCurta)}</p>${i.sinopse.length > i.sinopseCurta.length ? `<details><summary>Ler sinopse completa</summary><p>${esc(i.sinopse)}</p></details>` : ''}</div>`
    : '';
  const extras = [i.duracao ? `${esc(String(i.duracao))} min` : '', i.classificacao ? esc(String(i.classificacao)) : ''].filter(Boolean);
  const onde = i.tipo === 'cinema'
    ? `<div class="onde"><p class="onde-t">Programação nas redes</p><ul class="redes">${i.redes.map((r) => `<li><a href="${esc(r.href)}" rel="noopener">${esc(r.nome)}</a></li>`).join('')}</ul></div>`
    : `<div class="onde">${i.estreiaTxt ? `<p class="estreia">${esc(i.estreiaTxt)}</p>` : ''}<p class="onde-t">Onde assistir</p>${plataformasHtml(i)}${i.canais.length ? `<p class="canais">Canais: ${i.canais.map(esc).join(', ')}</p>` : ''}</div>`;

  return `<article class="cartao tom-${tom}" data-gen=" ${esc(i.generosSlug.join(' '))} " aria-labelledby="t-${esc(i.id)}">
  <div class="cartao-topo">
    ${i.poster
      ? `<a class="poster" href="${esc(i.tmdbUrl)}" rel="noopener" tabindex="-1"><img src="${esc(i.poster)}" alt="Pôster de ${esc(i.titulo)}" width="342" height="513" loading="lazy"></a>`
      : `<span class="poster poster--vazio" aria-hidden="true">${esc(i.inicial)}</span>`}
    <div class="cartao-info">
      <p class="data">${ico('calendario')}<time datetime="${esc(i.data)}">${esc(i.dataMini)}</time></p>
      <h3 id="t-${esc(i.id)}"><a href="${esc(i.tmdbUrl)}" rel="noopener">${esc(i.titulo)}</a></h3>
      ${i.original && i.original !== i.titulo ? `<p class="original">${esc(i.original)}</p>` : ''}
      <p class="medidas">${i.notaTxt ? `<span class="nota">${ico('estrela')}${esc(i.notaTxt)} <small>TMDB</small></span>` : ''}${extras.map((x) => `<span>${x}</span>`).join('')}</p>
    </div>
  </div>
  <ul class="gens" aria-label="Gêneros">${gens.map((g, k) => `<li>${ico(nomeIcone(i.generosSlug[k]))}${esc(g)}</li>`).join('')}</ul>
  ${sinopse}
  ${selosHtml(i)}
  ${onde}
  <p class="acoes">
    ${i.trailerUrl ? `<a class="botao botao--forte" href="${esc(i.trailerUrl)}" rel="noopener">${ico('play')}Trailer</a>` : ''}
    <a class="botao" href="${esc(i.tmdbUrl)}" rel="noopener">TMDB ${ico('seta')}</a>
    ${i.justwatchUrl ? `<a class="botao" href="${esc(i.justwatchUrl)}" rel="noopener">JustWatch ${ico('seta')}</a>` : ''}
  </p>
</article>`;
}

export function render(d) {
  const s = d.semana;
  let n = 0;
  const areas = [
    ['cinema', 'Nos cinemas', 'ingresso', s.cinema, 'Estreias nas salas desta semana'],
    ['filmes', 'Filmes no streaming', 'tela', s.filmes, 'Para ver em casa'],
    ['series', 'Séries', 'tv', s.series, 'Estreias de séries e temporadas'],
  ];
  const secoes = areas.map(([id, nome, icone, itens, sub]) => `<section class="area" id="${id}" aria-labelledby="h-${id}" data-area>
  <header class="area-cab">
    <span class="area-ico">${ico(icone)}</span>
    <div><h2 id="h-${id}">${esc(nome)} <span class="conta" data-conta>${itens.length}</span></h2><p>${esc(sub)}</p></div>
  </header>
  <div class="grade">${itens.map((i) => cartao(i, n++)).join('\n')}</div>
</section>`).join('\n');

  const bolhas = d.generos.map((g, k) => `<li><button type="button" class="bolha bolha--${TONS[k % 4]}" data-filtro="${esc(g.slug)}" aria-pressed="false">${ico(nomeIcone(g.slug))}${esc(g.nome)} <span>${g.qtd}</span></button></li>`).join('');

  return `<!doctype html>
<html lang="pt-BR">
${head(ID, d, { titulo: `Streaming Radar · Semana ${d.semana.numero} · ${d.tema ? 'tema Lens' : 'modelo Lente amigável'}`, extra: `<script src="/${ID}/filtro.js" defer></script>\n<script src="/assets/tema.js?v=${d.versao}" defer></script>\n` })}
<body>
${sprite}
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo">
  <div class="caixa topo-in">
    <a class="marca" href="#inicio">${mascote('marca-ico')}<span>Streaming Radar</span><small>v${esc(d.versao)}</small></a>
    ${d.seletorTemas}
    <nav class="nav" aria-label="Principal">
      <a href="${esc(d.site)}">Semana</a>
      <a href="${esc(d.catalogo.url)}">Catálogo</a>
    </nav>
  </div>
</header>

<main id="conteudo">
  <section class="hero" id="inicio" aria-labelledby="titulo">
    <div class="caixa hero-in">
      ${mascote('mascote')}
      <p class="hero-rotulo">Lançamentos da semana</p>
      <h1 id="titulo">Semana ${esc(d.semana.numero)}</h1>
      <p class="faixa">${esc(s.faixa)} de ${esc(s.ano)}</p>
      <p class="hero-sub">${d.totais.itens} estreias para ver nos cinemas e no streaming, escolhidas pelo radar.</p>
      <div class="semanas-nav">
        ${d.anterior ? `<a class="botao botao--grande" href="${esc(d.anterior.url)}" rel="prev">${ico('esq')}<span>${esc(d.anterior.faixa)}</span></a>` : ''}
        ${d.proxima ? `<a class="botao botao--grande botao--forte" href="${esc(d.proxima.url)}" rel="next"><span>${esc(d.proxima.faixa)}</span>${ico('dir')}</a>` : ''}
      </div>
      <details class="todas">
        <summary>Todas as semanas</summary>
        <ul>${d.semanas.map((w) => `<li><a href="${esc(w.url)}"${w.slug === s.slug ? ' aria-current="page"' : ''}>${esc(w.faixa)}</a></li>`).join('')}</ul>
      </details>
      <ul class="resumo" aria-label="Áreas da semana">
        <li><a class="resumo-c tom-lilas" href="#cinema">${ico('ingresso')}<strong>${d.totais.cinema}</strong><span>Cinema</span></a></li>
        <li><a class="resumo-c tom-pessego" href="#filmes">${ico('tela')}<strong>${d.totais.filmes}</strong><span>Filmes no streaming</span></a></li>
        <li><a class="resumo-c tom-menta" href="#series">${ico('tv')}<strong>${d.totais.series}</strong><span>Séries</span></a></li>
      </ul>
    </div>
  </section>

  <section class="caixa filtros" aria-labelledby="t-filtros" data-filtros>
    <h2 id="t-filtros">Escolha um clima</h2>
    <ul class="bolhas">
      <li><button type="button" class="bolha bolha--todos" data-filtro="" aria-pressed="true">${ico('fantasia')}Todos <span>${d.totais.itens}</span></button></li>
      ${bolhas}
    </ul>
    <p class="vazio" data-vazio hidden>Nenhum lançamento nesse gênero. Que tal outro?</p>
  </section>

  <div class="caixa areas">
${secoes}
  </div>
</main>

<footer class="rodape">
  <div class="caixa rodape-in">
    ${mascote('rodape-mascote')}
    <div class="rodape-corpo">
      <p class="rodape-links"><a href="${esc(d.site)}">Semana</a><a href="${esc(d.catalogo.url)}">Catálogo</a><a href="${esc(d.creditos.github)}" rel="noopener">GitHub</a></p>
      ${creditos(d)}
      <p class="creditos-extra">${esc(d.creditos.justwatch)}</p>
    </div>
  </div>
</footer>
</body>
</html>
`;
}
