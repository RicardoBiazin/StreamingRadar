// Modelo "instagram": o Streaming Radar como um perfil de rede social em grade.
// Avatar em anel de gradiente, destaques (stories) com as plataformas da semana, abas com
// ícones, grade de pôsteres em 3 colunas e vista em feed com legenda. Sem JS tudo aparece em feed.

import { esc, head, creditos } from '../_base.mjs';

export const meta = {
  nome: 'Perfil em grade',
  inspiracao: 'Instagram (instagram.com)',
  descricao: 'Perfil com avatar em anel de gradiente, plataformas como destaques e os lançamentos como publicações numa grade de pôsteres ou em feed.',
};

const ID = 'instagram';

// Ícones lineares próprios (viewBox 0 0 24 24).
const ICONES = {
  cinema: '<path d="M3 10h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 10l2.2-5.2 14.3-2.6.9 4.6L3 10z"/><path d="M8.5 4.3l2.2 4.3M14 3.3l2.2 4.3"/>',
  filmes: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  series: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 3l4 4 4-4"/>',
  grade: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  feed: '<rect x="4" y="3" width="16" height="8" rx="1.5"/><rect x="4" y="13" width="16" height="8" rx="1.5"/>',
  coracao: '<path d="M12 20.5s-8-4.9-9.5-10A5 5 0 0 1 12 7.2a5 5 0 0 1 9.5 3.3c-1.5 5.100-9.500 10-9.500 10z"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.500l5.500 3.500-5.500 3.500z"/>',
  marcador: '<path d="M6 3h12v18l-6-4.500L6 21z"/>',
  casa: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  agenda: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  catalogo: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 8h6"/>',
  radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12l6.500-6.500"/><circle cx="12" cy="12" r="1"/>',
  esq: '<path d="M15 5l-7 7 7 7"/>',
  dir: '<path d="M9 5l7 7-7 7"/>',
  estrela: '<path d="M12 3l2.700 5.600 6.100.8-4.500 4.200 1.100 6.100L12 16.800 6.600 19.700l1.100-6.100L3.200 9.400l6.100-.8z"/>',
  fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
  tudo: '<circle cx="6" cy="6" r="2.500"/><circle cx="18" cy="6" r="2.500"/><circle cx="6" cy="18" r="2.500"/><circle cx="18" cy="18" r="2.500"/><circle cx="12" cy="12" r="2.500"/>',
};
const ic = (n, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONES[n]}</svg>`;

const AREAS = {
  cinema: { rotulo: 'Cinema', titulo: 'Estreias nos cinemas', unidade: ['estreia', 'estreias'], icone: 'cinema' },
  filmes: { rotulo: 'Filmes', titulo: 'Filmes no streaming', unidade: ['filme', 'filmes'], icone: 'filmes' },
  series: { rotulo: 'Séries', titulo: 'Séries e novas temporadas', unidade: ['série', 'séries'], icone: 'series' },
};

export function render(d) {
  const slugPlat = new Map(d.plataformas.map((p) => [p.nome, p.slug]));
  const logos = new Map();
  for (const i of d.semana.itens) for (const p of i.plataformas) if (p.logo && !logos.has(p.nome)) logos.set(p.nome, p.logo);

  const chipPlat = (p) => `<li><a class="chip plat" href="${esc(p.href)}" rel="noopener">${p.logo ? `<img src="${esc(p.logo)}" alt="" width="16" height="16" loading="lazy">` : ''}${esc(p.nome)}${p.tipo !== 'assinatura' ? `<small>${esc(p.tipo)}</small>` : ''}</a></li>`;

  const post = (i, area) => {
    const slugs = i.plataformas.map((p) => slugPlat.get(p.nome)).filter(Boolean);
    const logo1 = i.plataformas.find((p) => p.logo);
    const longa = i.sinopse && i.sinopse.length > i.sinopseCurta.length;
    const meta1 = [i.duracao ? `${i.duracao} min` : null, i.classificacao ? `Classificação ${i.classificacao}` : null].filter(Boolean);
    return `<article class="post" id="p-${esc(i.id)}" data-tipo="${esc(i.tipo)}" data-gen="${esc(i.generosSlug.join(' '))}" data-plat="${esc(slugs.join(' '))}">
      <header class="post-topo">
        <span class="mini-anel" aria-hidden="true"><span>${ic(AREAS[area].icone, 'ico-mini')}</span></span>
        <div class="post-quem">
          <h3 class="post-titulo">${esc(i.titulo)}</h3>
          <p class="post-sub">${esc(i.tipoRotulo)} · <time datetime="${esc(i.data)}">${esc(i.dataLonga)}</time></p>
        </div>
        <button class="fechar" type="button" aria-label="Fechar publicação">${ic('fechar')}</button>
      </header>
      <figure class="midia">
        ${i.poster
          ? `<img class="poster" src="${esc(i.poster)}" srcset="${esc(i.poster)} 342w, ${esc(i.posterGrande)} 500w" sizes="(max-width: 735px) 100vw, 320px" width="342" height="513" loading="lazy" alt="Pôster de ${esc(i.titulo)}">`
          : `<span class="sem-poster" role="img" aria-label="Sem pôster: ${esc(i.titulo)}">${esc(i.inicial)}</span>`}
        <span class="selo-data"><time datetime="${esc(i.data)}">${esc(i.dataMini)}</time></span>
        ${i.notaTxt ? `<span class="selo-nota">${ic('estrela', 'ico-mini')}<span class="vh">Nota TMDB </span>${esc(i.notaTxt)}</span>` : ''}
        ${logo1 ? `<img class="selo-plat" src="${esc(logo1.logo)}" alt="" width="26" height="26" loading="lazy">` : ''}
        <span class="selo-titulo" aria-hidden="true">${esc(i.titulo)}</span>
      </figure>
      <div class="acoes">
        <a class="acao" href="${esc(i.tmdbUrl)}" rel="noopener">${ic('coracao')}<span>TMDB</span></a>
        ${i.trailerUrl ? `<a class="acao" href="${esc(i.trailerUrl)}" rel="noopener">${ic('play')}<span>Trailer</span></a>` : ''}
        ${i.justwatchUrl ? `<a class="acao salvar" href="${esc(i.justwatchUrl)}" rel="noopener">${ic('marcador')}<span>JustWatch</span></a>` : ''}
      </div>
      <div class="legenda">
        ${i.notaTxt ? `<p class="curtidas">${ic('estrela', 'ico-mini')}Nota ${esc(i.notaTxt)} no TMDB${i.votos ? ` · ${i.votos} ${i.votos === 1 ? 'voto' : 'votos'}` : ''}</p>` : ''}
        <p class="texto"><strong>${esc(i.titulo)}</strong>${i.original && i.original !== i.titulo ? ` <span class="original">(${esc(i.original)})</span>` : ''} ${esc(i.sinopseCurta)}</p>
        ${longa ? `<details class="mais"><summary>ver sinopse completa</summary><p>${esc(i.sinopse)}</p></details>` : ''}
        ${i.estreiaTxt ? `<p class="estreia">${esc(i.estreiaTxt)}</p>` : ''}
        <p class="tags">${i.generos.map((g) => `<span>#${esc(g.replace(/\s+/g, ''))}</span>`).join(' ')}</p>
        ${meta1.length ? `<p class="duracao">${esc(meta1.join(' · '))}</p>` : ''}
        ${i.tipo === 'cinema'
          ? `<div class="bloco"><p class="rot">Programação nas redes</p><ul class="chips">${i.redes.map((r) => `<li><a class="chip" href="${esc(r.href)}" rel="noopener">${esc(r.nome)}</a></li>`).join('')}</ul></div>`
          : `<div class="bloco"><p class="rot">${i.semPlataforma ? 'Onde assistir' : 'Onde assistir'}</p>${i.semPlataforma
            ? '<p class="sem-plat">Plataforma ainda não informada</p>'
            : `<ul class="chips">${i.plataformas.map(chipPlat).join('')}</ul>`}</div>`}
        ${i.canais.length ? `<p class="canais"><span>Canais:</span> ${esc(i.canais.join(', '))}</p>` : ''}
        ${i.selos ? `<ul class="selos">${[
          i.selos.imdb ? `<li><a class="chip" href="${esc(i.selos.imdb.href)}" rel="noopener">IMDb ${esc(i.selos.imdb.txt)}</a></li>` : '',
          i.selos.rt ? `<li><a class="chip" href="${esc(i.selos.rt.href)}" rel="noopener">Rotten Tomatoes ${esc(i.selos.rt.txt)}</a></li>` : '',
          i.selos.mc ? `<li><a class="chip" href="${esc(i.selos.mc.href)}" rel="noopener">Metacritic ${esc(i.selos.mc.txt)}</a></li>` : '',
        ].join('')}</ul>` : ''}
      </div>
    </article>`;
  };

  const painel = (chave, lista) => {
    const a = AREAS[chave];
    const ord = [...lista].sort((x, y) => x.data.localeCompare(y.data));
    return `<section class="painel" id="${chave}" data-painel="${chave}" aria-labelledby="h-${chave}">
      <header class="painel-topo">
        <h2 id="h-${chave}">${a.titulo}</h2>
        <p><span class="qtd">${lista.length}</span> ${lista.length === 1 ? a.unidade[0] : a.unidade[1]} na semana</p>
      </header>
      <div class="lista">
        ${ord.map((i) => post(i, chave)).join('\n        ')}
      </div>
      <p class="vazio" hidden>Nenhuma publicação com esse filtro.</p>
    </section>`;
  };

  const s = d.semana;
  const tabs = ['cinema', 'filmes', 'series'].map((k, n) => `<a href="#${k}" data-painel="${k}"${n === 0 ? ' class="ativa"' : ''}>${ic(AREAS[k].icone, 'ico-aba')}<span class="aba-rot">${AREAS[k].rotulo}</span><span class="aba-n" data-n="${k}">${s[k].length}</span></a>`).join('\n      ');

  const stories = d.plataformas.map((p) => `<li><a class="story" href="${esc(p.href || '#conteudo')}" rel="noopener" data-plat="${esc(p.slug)}">
        <span class="story-anel" aria-hidden="true"><span>${logos.get(p.nome) ? `<img src="${esc(logos.get(p.nome))}" alt="" width="45" height="45" loading="lazy">` : esc(p.nome.slice(0, 1))}</span></span>
        <span class="story-nome">${esc(p.nome)}</span><span class="story-qtd">${p.qtd}</span></a></li>`).join('\n      ');

  const semanas = d.semanas.map((w) => `<li><a href="${esc(w.url)}"${w.slug === s.slug ? ' aria-current="page"' : ''}>${esc(w.faixa)}</a></li>`).join('');

  return `<!doctype html>
<html lang="pt-BR">
${head(ID, d, { titulo: `Streaming Radar: semana ${s.numero}, ${s.faixa}`, extra: `<script src="/${ID}/filtro.js?v=${d.versao}" defer></script>\n<script src="/assets/tema.js?v=${d.versao}" defer></script>\n` })}
<body>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="nav">
  <div class="nav-in">
    <a class="marca" href="#topo">${ic('radar', 'ico-marca')}<strong>Streaming Radar</strong><span class="versao">v${esc(d.versao)}</span></a>
    ${d.seletorTemas}
    <nav aria-label="Site oficial">
      <a href="${esc(d.site)}">Semana</a>
      <a href="${esc(d.catalogo.url)}">Catálogo</a>
    </nav>
  </div>
</header>

<main id="conteudo">
  <section class="perfil" id="topo" aria-labelledby="t-semana">
    <div class="avatar-anel" aria-hidden="true"><span class="avatar">${ic('radar', 'ico-avatar')}</span></div>
    <div class="perfil-info">
      <div class="perfil-linha">
        <p class="usuario">streamingradar</p>
        <div class="perfil-botoes">
          <a class="btn azul" href="${esc(d.site)}">Semana</a>
          <a class="btn cinza" href="${esc(d.catalogo.url)}">Catálogo</a>
        </div>
      </div>
      <ul class="numeros">
        <li><strong>${d.totais.itens}</strong> lançamentos</li>
        <li><strong>${d.totais.cinema}</strong> cinema</li>
        <li><strong>${d.totais.filmes}</strong> filmes</li>
        <li><strong>${d.totais.series}</strong> séries</li>
      </ul>
      <div class="bio">
        <p class="bio-nome">Streaming Radar · cinema e streaming</p>
        <h1 id="t-semana">Semana ${esc(s.numero)} de ${esc(s.ano)}: ${esc(s.faixa)}</h1>
        <p class="bio-texto">Estreias nos cinemas, filmes e séries que chegam ao streaming no Brasil, com notas e onde assistir.</p>
        <p class="bio-tags">#cinema #streaming #series</p>
        <div class="navsemana">
          ${d.anterior ? `<a class="btn cinza" href="${esc(d.anterior.url)}" rel="prev" aria-label="Semana anterior: ${esc(d.anterior.faixa)}">${ic('esq', 'ico-btn')}Anterior</a>` : ''}
          ${d.proxima ? `<a class="btn cinza" href="${esc(d.proxima.url)}" rel="next" aria-label="Próxima semana: ${esc(d.proxima.faixa)}">Próxima${ic('dir', 'ico-btn')}</a>` : ''}
        </div>
        <details class="semanas" id="semanas">
          <summary>${ic('agenda', 'ico-btn')}Todas as semanas (${d.semanas.length})</summary>
          <ul>${semanas}</ul>
        </details>
      </div>
    </div>
  </section>

  <section class="destaques" id="destaques" aria-labelledby="t-destaques">
    <h2 id="t-destaques" class="vh">Plataformas e gêneros da semana</h2>
    <ul class="stories">
      <li><a class="story tudo" href="#cinema" data-plat="" aria-pressed="true">
        <span class="story-anel" aria-hidden="true"><span>${ic('tudo', 'ico-tudo')}</span></span>
        <span class="story-nome">Tudo</span><span class="story-qtd">${d.totais.itens}</span></a></li>
      ${stories}
    </ul>
    <div class="generos" hidden>
      <p class="vh">Filtrar por gênero</p>
      ${d.generos.map((g) => `<button type="button" class="gen" data-gen="${esc(g.slug)}" aria-pressed="false">#${esc(g.nome.replace(/\s+/g, ''))}<span>${g.qtd}</span></button>`).join('\n      ')}
    </div>
  </section>

  <div class="abas-faixa">
    <nav class="abas" aria-label="Áreas">
      ${tabs}
    </nav>
  </div>

  <div class="barra-vista" hidden>
    <p class="estado" role="status" aria-live="polite"></p>
    <div class="vistas" role="group" aria-label="Modo de exibição">
      <button type="button" class="vista" data-vista="grade" aria-pressed="true" aria-label="Grade">${ic('grade')}</button>
      <button type="button" class="vista" data-vista="feed" aria-pressed="false" aria-label="Feed">${ic('feed')}</button>
    </div>
  </div>

  <div class="paineis">
    ${painel('cinema', s.cinema)}
    ${painel('filmes', s.filmes)}
    ${painel('series', s.series)}
  </div>
</main>

<footer class="rodape">
  <nav aria-label="Rodapé"><a href="${esc(d.site)}">Semana</a><a href="${esc(d.catalogo.url)}">Catálogo</a><a href="#semanas">Todas as semanas</a><a href="https://www.themoviedb.org/" rel="noopener">TMDB</a><a href="https://www.justwatch.com/br" rel="noopener">JustWatch</a></nav>
  ${creditos(d)}
</footer>

<nav class="barra-app" aria-label="Atalhos">
  <a href="#topo">${ic('casa')}<span>Início</span></a>
  <a href="#semanas">${ic('agenda')}<span>Semanas</span></a>
  <a href="${esc(d.site)}">${ic('radar')}<span>Semana</span></a>
  <a href="${esc(d.catalogo.url)}">${ic('catalogo')}<span>Catálogo</span></a>
</nav>
</body>
</html>
`;
}
