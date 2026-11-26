// Modelo "tiktok": vídeo curto em tema escuro, inspirado no layout do tiktok.com.
// Fundo preto, barra lateral fixa, chips em pílula, cartões verticais 9:16 com o pôster
// ocupando tudo, coluna de ícones à direita e deslocamento cromático ciano/rosa nos títulos.
// Nada de logotipo, nome ou texto da referência.

import { esc, head, creditos } from '../_base.mjs';

export const meta = {
  nome: 'Vídeo curto escuro',
  inspiracao: 'TikTok (tiktok.com)',
  descricao: 'Tema preto com barra lateral, chips em pílula, cartões verticais 9:16 com ícones à direita e deslocamento cromático ciano e rosa.',
};

const ID = 'tiktok';

// Ícones próprios (viewBox 24). "f" = preenchido, senão traço.
const ICONES = {
  estrela: ['f', '<path d="M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.4L12 17.4l-5.7 3 1.1-6.4L2.8 9.5l6.4-.9z"/>'],
  play: ['f', '<path d="M8 5v14l11-7z"/>'],
  tmdb: ['s', '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12.5l9 5 9-5"/><path d="M3 17l9 5 9-5"/>'],
  assistir: ['s', '<rect x="3" y="5" width="18" height="12" rx="2.5"/><path d="M8 21h8M12 17v4"/><path d="M10.5 8.5v5l4-2.5z" fill="currentColor"/>'],
  casa: ['s', '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>'],
  cinema: ['s', '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 6l3 4M12 6l3 4M17 6l3 4"/>'],
  filme: ['s', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 8h3M4 12h3M4 16h3M17 8h3M17 12h3M17 16h3M9 3v18M15 3v18"/>'],
  serie: ['s', '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>'],
  catalogo: ['s', '<path d="M4 5h16M4 10h16M4 15h10M4 20h7"/>'],
  calendario: ['s', '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'],
  esq: ['s', '<path d="M15 5l-7 7 7 7"/>'],
  dir: ['s', '<path d="M9 5l7 7-7 7"/>'],
  lua: ['s', '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'],
  fogo: ['f', '<path d="M12 2c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4.4.2 1.6 1 2.4 1.8 2.8C11 8 10.5 5 12 2z"/>'],
};
const ic = (n, cls = 'ic') => {
  const [t, p] = ICONES[n];
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" ${t === 'f' ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'}>${p}</svg>`;
};

const marca = () => `<svg class="marca-svg" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
  <circle cx="18" cy="22" r="13" fill="none" stroke="#25f4ee" stroke-width="3"/>
  <circle cx="22" cy="18" r="13" fill="none" stroke="#fe2c55" stroke-width="3"/>
  <path d="M20 20L31 9" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>
  <circle cx="20" cy="20" r="2.6" fill="#fff"/>
</svg>`;

export function render(d) {
  const s = d.semana;
  const slugPlat = new Map(d.plataformas.map((p) => [p.nome, p.slug]));

  const botaoIcone = (href, icone, rotulo, aria) =>
    `<a class="ib" href="${esc(href)}" rel="noopener" aria-label="${esc(aria)}"><span class="ib-c">${ic(icone)}</span><span class="ib-t">${esc(rotulo)}</span></a>`;

  const cartao = (i) => {
    const plats = i.plataformas.map((p) => slugPlat.get(p.nome)).filter(Boolean);
    const acoes = [];
    if (i.notaTxt) acoes.push(`<span class="ib nota" title="Nota TMDB ${esc(i.notaTxt)} (${i.votos} votos)" role="img" aria-label="Nota TMDB ${esc(i.notaTxt)}"><span class="ib-c">${ic('estrela')}</span><span class="ib-t">${esc(i.notaTxt)}</span></span>`);
    if (i.trailerUrl) acoes.push(botaoIcone(i.trailerUrl, 'play', 'Trailer', `Trailer de ${i.titulo} no YouTube`));
    acoes.push(botaoIcone(i.tmdbUrl, 'tmdb', 'TMDB', `${i.titulo} no TMDB`));
    if (i.justwatchUrl) acoes.push(botaoIcone(i.justwatchUrl, 'assistir', 'Assistir', `Onde assistir ${i.titulo} (JustWatch)`));

    let bloco = '';
    if (i.tipo === 'cinema') {
      bloco = `<div class="redes-bloco"><p class="rot">Programação nas redes</p><ul class="redes">${i.redes.map((r) => `<li><a href="${esc(r.href)}" rel="noopener">${esc(r.nome)}</a></li>`).join('')}</ul></div>`;
    } else if (i.semPlataforma) {
      bloco = '<p class="sem-plat">Plataforma ainda não informada</p>';
    } else {
      bloco = `<ul class="plats" aria-label="Onde assistir">${i.plataformas.map((p) => `<li><a href="${esc(p.href)}" rel="noopener">${p.logo ? `<img src="${esc(p.logo)}" alt="" width="16" height="16" loading="lazy">` : ''}<span>${esc(p.nome)}</span>${p.tipo !== 'assinatura' ? `<small>${esc(p.tipo)}</small>` : ''}</a></li>`).join('')}</ul>`;
    }

    const selos = i.selos ? Object.entries({ imdb: 'IMDb', rt: 'Rotten Tomatoes', mc: 'Metacritic' })
      .filter(([k]) => i.selos[k]).map(([k, nome]) => `<li><a href="${esc(i.selos[k].href)}" rel="noopener">${nome} <strong>${esc(i.selos[k].txt)}</strong></a></li>`).join('') : '';

    const extras = [i.duracao ? `${i.duracao} min` : '', i.classificacao || ''].filter(Boolean).join(' · ');
    const quando = [i.estreiaTxt || '', extras].filter(Boolean).join(' · ');

    return `<article class="cartao" id="item-${esc(i.id)}" data-gen="${esc(i.generosSlug.join(' '))}" data-plat="${esc(plats.join(' '))}">
      <div class="poster">${i.poster ? `<img src="${esc(i.posterGrande)}" alt="Pôster de ${esc(i.titulo)}" width="500" height="750" loading="lazy">` : `<span class="sem-poster" role="img" aria-label="Sem pôster: ${esc(i.titulo)}">${esc(i.inicial)}</span>`}</div>
      <span class="etq">${esc(i.tipoRotulo)}</span>
      <div class="acoes">${acoes.join('')}</div>
      <div class="info">
        <h3 class="tit">${esc(i.titulo)}</h3>
        ${i.original && i.original !== i.titulo ? `<p class="orig">${esc(i.original)}</p>` : ''}
        <p class="quando"><time datetime="${esc(i.data)}">${esc(i.dataMini)}</time>${quando ? ` · ${esc(quando)}` : ''}</p>
        <p class="gens">${esc(i.generos.join(' · '))}</p>
        ${bloco}
        <details class="mais"><summary>Sinopse e mais</summary>
          <p class="sin">${esc(i.sinopse || 'Sem sinopse disponível.')}</p>
          ${i.canais.length ? `<p class="canais"><b>Canais:</b> ${esc(i.canais.join(', '))}</p>` : ''}
          ${selos ? `<ul class="selos" aria-label="Notas de críticos">${selos}</ul>` : ''}
        </details>
      </div>
    </article>`;
  };

  const secao = (id, titulo, icone, itens, resumo) => `<section class="area" id="${id}" aria-labelledby="t-${id}">
    <header class="area-topo">
      <span class="area-ico">${ic(icone)}</span>
      <div><h2 id="t-${id}" class="glitch-s">${esc(titulo)}</h2><p>${esc(resumo)}</p></div>
      <span class="conta" data-total="${itens.length}">${itens.length} ${itens.length === 1 ? 'título' : 'títulos'}</span>
    </header>
    <div class="grade">
    ${itens.map(cartao).join('\n    ')}
    </div>
    <p class="vazio-area" hidden>Nada com esses filtros nesta área.</p>
  </section>`;

  // "Em alta": maiores notas da semana (com um mínimo de votos para não premiar nota de 1 voto)
  const comNota = s.itens.filter((i) => i.nota);
  const firmes = comNota.filter((i) => (i.votos || 0) >= 30);
  const alta = (firmes.length >= 8 ? firmes : comNota).slice().sort((a, b) => b.nota - a.nota || (b.votos || 0) - (a.votos || 0)).slice(0, 10);

  const faixaAlta = alta.length ? `<section class="alta" aria-labelledby="t-alta">
    <h2 id="t-alta" class="glitch-s"><span class="fogo">${ic('fogo')}</span>Em alta na semana</h2>
    <p class="alta-sub">Maiores notas do TMDB entre os lançamentos.</p>
    <ol class="alta-lista">
      ${alta.map((i, k) => `<li><a class="alta-item" href="#item-${esc(i.id)}" aria-label="${k + 1}º: ${esc(i.titulo)}, nota ${esc(i.notaTxt)}">
        ${i.poster ? `<img src="${esc(i.poster)}" alt="" width="342" height="513" loading="lazy">` : `<span class="sem-poster">${esc(i.inicial)}</span>`}
        <span class="rank" aria-hidden="true">${k + 1}</span>
        <span class="alta-info"><strong>${esc(i.titulo)}</strong><span>${ic('estrela', 'ic mini')}${esc(i.notaTxt)} · ${esc(i.tipoRotulo)}</span></span>
      </a></li>`).join('\n      ')}
    </ol>
  </section>` : '';

  const chipsGen = d.generos.map((g) => `<button type="button" class="chip" data-filtro="gen" data-valor="${esc(g.slug)}" aria-pressed="false">${esc(g.nome)} <em>${g.qtd}</em></button>`).join('');
  const chipsPlat = d.plataformas.filter((p) => p.qtd >= 1).slice(0, 14).map((p) => `<button type="button" class="chip" data-filtro="plat" data-valor="${esc(p.slug)}" aria-pressed="false">${esc(p.nome)} <em>${p.qtd}</em></button>`).join('');

  const semanas = d.semanas.map((w) => `<li><a class="chip peq${w.slug === s.slug ? ' ativo' : ''}" href="${esc(w.url)}"${w.slug === s.slug ? ' aria-current="page"' : ''}>${esc(w.faixa)}</a></li>`).join('');

  const menu = `<nav class="menu" aria-label="Principal">
    <a class="ativo" href="#topo" aria-current="true">${ic('casa')}<span>Semana</span></a>
    <a href="#cinema">${ic('cinema')}<span>Cinema</span><em>${d.totais.cinema}</em></a>
    <a href="#filmes">${ic('filme')}<span>Filmes</span><em>${d.totais.filmes}</em></a>
    <a href="#series">${ic('serie')}<span>Séries</span><em>${d.totais.series}</em></a>
    <a href="${esc(d.catalogo.url)}">${ic('catalogo')}<span>Catálogo</span></a>
  </nav>`;

  return `<!doctype html>
<html lang="pt-BR">
${head(ID, d, { titulo: `Streaming Radar · semana ${s.faixa}`, extra: `<script src="/${ID}/filtro.js" defer></script>\n` })}
<body>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>

<header class="lateral" id="menu-topo">
  <div class="lat-topo">
    <a class="marca" href="${esc(d.site)}" aria-label="Streaming Radar, site oficial">
      <span class="marca-sinal">${marca()}</span>
      <span class="marca-txt"><strong>Streaming Radar</strong><span>v${esc(d.versao)}</span></span>
    </a>
    <button type="button" class="tema" hidden aria-pressed="false" aria-label="Alternar tema claro e escuro">${ic('lua')}<span>Tema</span></button>
  </div>
  ${menu}
  <div class="lado-extra">
    <p class="lado-rotulo">Semanas</p>
    <div class="lado-sem">
      ${d.anterior ? `<a class="btn cinza" href="${esc(d.anterior.url)}" rel="prev">${ic('esq')}<span>${esc(d.anterior.faixa)}</span></a>` : ''}
      ${d.proxima ? `<a class="btn cinza" href="${esc(d.proxima.url)}" rel="next"><span>${esc(d.proxima.faixa)}</span>${ic('dir')}</a>` : ''}
      <a class="btn rosa largo" href="#semanas">${ic('calendario')}Todas as semanas</a>
    </div>
    <a class="lado-site" href="${esc(d.site)}">Site oficial: Semana</a>
    <p class="lado-nota">${d.totais.itens} lançamentos em ${esc(s.faixa)}. Catálogo com ${d.catalogo.titulos != null ? d.catalogo.titulos.toLocaleString('pt-BR') : 'milhares de'} títulos.</p>
  </div>
</header>

<main id="conteudo">
  <section class="hero" id="topo" aria-labelledby="t-hero">
    <p class="selo-topo"><span class="ponto" aria-hidden="true"></span>Semana ${esc(s.numero)} de ${esc(s.ano)}</p>
    <h1 id="t-hero" class="glitch">Lançamentos de <span>${esc(s.faixa)}</span></h1>
    <p class="sub">Cinema, filmes no streaming e séries que estreiam no Brasil nesta semana.</p>
    <ul class="numeros">
      <li><strong>${d.totais.itens}</strong><span>lançamentos</span></li>
      <li><strong>${d.totais.cinema}</strong><span>no cinema</span></li>
      <li><strong>${d.totais.filmes}</strong><span>filmes no streaming</span></li>
      <li><strong>${d.totais.series}</strong><span>séries</span></li>
    </ul>
    <nav class="nav-sem" aria-label="Navegar entre semanas">
      ${d.anterior ? `<a class="btn cinza" href="${esc(d.anterior.url)}" rel="prev">${ic('esq')}Semana anterior</a>` : ''}
      ${d.proxima ? `<a class="btn rosa" href="${esc(d.proxima.url)}" rel="next">Próxima semana${ic('dir')}</a>` : ''}
    </nav>
  </section>

  ${faixaAlta}

  <section class="filtros" aria-label="Filtros" hidden>
    <div class="fil-linha"><span class="fil-rot">Gênero</span><div class="chips" role="group" aria-label="Filtrar por gênero"><button type="button" class="chip ativo" data-filtro="gen" data-valor="" aria-pressed="true">Todos</button>${chipsGen}</div></div>
    <div class="fil-linha"><span class="fil-rot">Plataforma</span><div class="chips" role="group" aria-label="Filtrar por plataforma"><button type="button" class="chip ativo" data-filtro="plat" data-valor="" aria-pressed="true">Todas</button>${chipsPlat}</div></div>
    <p class="fil-estado" role="status" aria-live="polite"></p>
  </section>

  ${secao('cinema', 'Cinema', 'cinema', s.cinema, 'Estreias nos cinemas, com a programação das 7 redes.')}
  ${secao('filmes', 'Filmes no streaming', 'filme', s.filmes, 'Filmes que chegam às plataformas.')}
  ${secao('series', 'Séries', 'serie', s.series, 'Séries e novas temporadas.')}

  <section class="semanas-bloco" id="semanas" aria-labelledby="t-semanas">
    <h2 id="t-semanas" class="glitch-s">Todas as semanas</h2>
    <details class="semanas" open>
      <summary>${d.semanas.length} semanas no site oficial</summary>
      <ul class="chips-wrap">${semanas}</ul>
    </details>
    <p class="atalho"><a class="btn cinza" href="${esc(d.catalogo.url)}">${ic('catalogo')}Catálogo${d.catalogo.plataformas ? ` de ${d.catalogo.plataformas} plataformas` : ''}</a></p>
  </section>

  <footer class="rodape">
    <p>${esc(d.creditos.justwatch)}</p>
    ${creditos(d)}
  </footer>
</main>
</body>
</html>
`;
}
