// Modelo "apple": minimalismo premium. Hero enorme centralizado, tiles de largura total
// (claro / preto) com uma fileira de pôsteres por área e, abaixo, a lista compacta com os detalhes.

import { esc, head, creditos } from '../_base.mjs';

export const meta = {
  nome: 'Minimalista premium',
  inspiracao: 'Apple (apple.com/br)',
  descricao: 'Hero com tipografia enorme, tiles de largura total alternando claro e preto, fileiras de pôsteres e listas compactas.',
};

const ID = 'apple';

const AREAS = [
  { chave: 'cinema', nome: 'Cinema', titulo: 'Nas telas grandes.', sub: 'Estreias em cartaz nas redes de cinema do Brasil.', tom: 'claro', lista: (s) => s.cinema },
  { chave: 'filmes', nome: 'Filmes no streaming', titulo: 'Direto no sofá.', sub: 'Filmes que chegam às plataformas de streaming.', tom: 'escuro', lista: (s) => s.filmes },
  { chave: 'series', nome: 'Séries', titulo: 'Para maratonar.', sub: 'Estreias de séries e de novas temporadas.', tom: 'claro', lista: (s) => s.series },
];

const slugPl = (nome) => nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const attrs = (i) => `data-gen="${esc(i.generosSlug.join(' '))}" data-plat="${esc(i.plataformas.map((p) => slugPl(p.nome)).join(' '))}"`;

const card = (i) => `<li class="cartao" ${attrs(i)}>
        <a href="#i-${esc(i.id)}" aria-label="${esc(i.titulo)}: ver detalhes">
          <span class="capa">${i.poster
    ? `<img src="${esc(i.poster)}" alt="Pôster de ${esc(i.titulo)}" width="342" height="513" loading="lazy" decoding="async">`
    : `<span class="inicial" aria-hidden="true">${esc(i.inicial)}</span>`}</span>
          <span class="c-titulo">${esc(i.titulo)}</span>
          <span class="c-data">${esc(i.dataMini)}</span>
        </a>
      </li>`;

const links = (i) => `<p class="links">
          <a href="${esc(i.tmdbUrl)}" rel="noopener">TMDB</a>
          ${i.trailerUrl ? `<a href="${esc(i.trailerUrl)}" rel="noopener">Trailer</a>` : ''}
          ${i.justwatchUrl ? `<a href="${esc(i.justwatchUrl)}" rel="noopener">JustWatch</a>` : ''}
        </p>`;

const selos = (i) => {
  if (!i.selos) return '';
  const s = [];
  if (i.selos.imdb) s.push(`<a href="${esc(i.selos.imdb.href)}" rel="noopener">IMDb <b>${esc(i.selos.imdb.txt)}</b></a>`);
  if (i.selos.rt) s.push(`<a href="${esc(i.selos.rt.href)}" rel="noopener">Rotten Tomatoes <b>${esc(i.selos.rt.txt)}</b></a>`);
  if (i.selos.mc) s.push(`<a href="${esc(i.selos.mc.href)}" rel="noopener">Metacritic <b>${esc(i.selos.mc.txt)}</b></a>`);
  return s.length ? `<p class="selos">${s.join('')}</p>` : '';
};

const onde = (i) => {
  if (i.tipo === 'cinema') {
    return `<div class="onde"><p class="rot">Programação nas redes</p><ul class="redes">${i.redes.map((r) => `<li><a href="${esc(r.href)}" rel="noopener">${esc(r.nome)}</a></li>`).join('')}</ul></div>`;
  }
  const extra = i.tipo === 'serie' ? `<p class="estreia">${esc(i.estreiaTxt)}${i.canais.length ? ` · ${esc(i.canais.join(', '))}` : ''}</p>` : '';
  if (i.semPlataforma) return `<div class="onde">${extra}<p class="rot">Plataforma ainda não informada</p></div>`;
  return `<div class="onde">${extra}<p class="rot">Onde assistir</p><ul class="plats">${i.plataformas.map((p) => `<li><a href="${esc(p.href)}" rel="noopener">${p.logo ? `<img src="${esc(p.logo)}" alt="" width="45" height="45" loading="lazy">` : ''}${esc(p.nome)}${p.tipo !== 'assinatura' ? `<small>${esc(p.tipo)}</small>` : ''}</a></li>`).join('')}</ul></div>`;
};

const linha = (i) => {
  const curta = i.sinopseCurta;
  const cortada = i.sinopse && i.sinopse !== curta;
  const meta = [
    ...(i.generos.length ? [esc(i.generos.join(', '))] : []),
    ...(i.duracao ? [`${esc(i.duracao)} min`] : []),
    ...(i.classificacao ? [`Classificação ${esc(i.classificacao)}`] : []),
  ];
  return `<li class="linha" id="i-${esc(i.id)}" ${attrs(i)}>
      <div class="l-lado">
        <p class="l-data"><time datetime="${esc(i.data)}">${esc(i.dataLonga)}</time></p>
        ${i.poster ? `<img class="l-poster" src="${esc(i.poster)}" alt="Pôster de ${esc(i.titulo)}" width="342" height="513" loading="lazy" decoding="async">` : `<div class="l-poster sem" aria-hidden="true">${esc(i.inicial)}</div>`}
      </div>
      <div class="l-corpo">
        <h4>${esc(i.titulo)}${i.nota ? `<span class="nota" title="Nota TMDB (${esc(i.votos)} votos)"><span aria-hidden="true">★</span> ${esc(i.notaTxt)}<span class="so-leitor"> na nota do TMDB</span></span>` : ''}</h4>
        ${i.original && i.original !== i.titulo ? `<p class="original">${esc(i.original)}</p>` : ''}
        ${meta.length ? `<p class="meta">${meta.join(' · ')}</p>` : ''}
        ${curta ? `<p class="sinopse">${esc(curta)}</p>` : ''}
        ${cortada ? `<details class="mais"><summary>Sinopse completa</summary><p>${esc(i.sinopse)}</p></details>` : ''}
        ${onde(i)}
        ${selos(i)}
        ${links(i)}
      </div>
    </li>`;
};

const tile = (a, d, n) => {
  const itens = a.lista(d.semana);
  return `<section class="tile ${a.tom}" id="${a.chave}" aria-labelledby="t-${a.chave}" data-area="${a.chave}">
  <header class="t-topo">
    <p class="sobretitulo">${esc(a.nome)} · <span class="qtd" data-total="${itens.length}">${itens.length}</span> ${itens.length === 1 ? 'lançamento' : 'lançamentos'}</p>
    <h2 id="t-${a.chave}">${esc(a.titulo)}</h2>
    <p class="sub">${esc(a.sub)}</p>
  </header>
  <div class="fileira-wrap">
    <div class="setas" hidden>
      <button type="button" class="seta" data-dir="-1" aria-label="Rolar ${esc(a.nome)} para a esquerda"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
      <button type="button" class="seta" data-dir="1" aria-label="Rolar ${esc(a.nome)} para a direita"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
    </div>
    <ul class="fileira" tabindex="0" role="region" aria-label="Pôsteres: ${esc(a.nome)}">
      ${itens.map(card).join('\n      ')}
    </ul>
  </div>
  <p class="vazio" hidden>Nenhum lançamento com esse filtro nesta área.</p>
  <div class="detalhes">
    <h3 class="d-titulo">Detalhes</h3>
    <ol class="lista">
    ${itens.map(linha).join('\n    ')}
    </ol>
  </div>
</section>`;
};

export function render(d) {
  const s = d.semana;
  const titulo = `Os lançamentos desta semana · ${s.faixa} · Streaming Radar`;
  return `<!doctype html>
<html lang="pt-BR">
${head(ID, d, { titulo, extra: `<script src="/${ID}/filtro.js" defer></script>\n<script src="/assets/tema.js?v=${d.versao}" defer></script>\n` })}
<body>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="nav">
  <div class="nav-in">
    <a class="marca" href="#topo"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 12L18 6"/><circle cx="12" cy="12" r="1.6"/></svg><strong>Streaming Radar</strong><span>v${esc(d.versao)}</span></a>
    ${d.seletorTemas}
    <nav aria-label="Principal">
      <a href="#cinema">Cinema</a>
      <a href="#filmes">Filmes</a>
      <a href="#series">Séries</a>
      <a class="nav-ext" href="${esc(d.site)}" rel="noopener">Semana</a>
      <a class="nav-ext" href="${esc(d.catalogo.url)}" rel="noopener">Catálogo</a>
    </nav>
  </div>
</header>

<main id="conteudo">
  <section class="tile hero" id="topo" aria-labelledby="t-hero">
    <p class="sobretitulo">Semana ${esc(s.numero)} · ${esc(s.faixa)}</p>
    <h1 id="t-hero">Os lançamentos<br>desta semana.</h1>
    <p class="sub">${d.totais.itens} estreias no cinema e no streaming, de ${esc(s.faixa)}. Tudo o que vale ver, em um só lugar.</p>
    <div class="botoes">
      <a class="pilula cheia" href="#cinema">Cinema <span class="n">${d.totais.cinema}</span></a>
      <a class="pilula" href="#filmes">Filmes no streaming <span class="n">${d.totais.filmes}</span></a>
      <a class="pilula" href="#series">Séries <span class="n">${d.totais.series}</span></a>
    </div>
    <p class="vizinhas">
      ${d.anterior ? `<a href="${esc(d.anterior.url)}" rel="noopener"><span aria-hidden="true">‹</span> Semana anterior <small>${esc(d.anterior.faixa)}</small></a>` : ''}
      ${d.proxima ? `<a href="${esc(d.proxima.url)}" rel="noopener">Próxima semana <small>${esc(d.proxima.faixa)}</small> <span aria-hidden="true">›</span></a>` : ''}
    </p>
  </section>

  <section class="filtro" id="filtro" aria-label="Filtros" hidden>
    <div class="filtro-in">
      <div class="chips" role="group" aria-label="Gênero">
        <button type="button" class="chip" data-gen="" aria-pressed="true">Todos</button>
        ${d.generos.map((g) => `<button type="button" class="chip" data-gen="${esc(g.slug)}" aria-pressed="false">${esc(g.nome)} <small>${g.qtd}</small></button>`).join('\n        ')}
      </div>
      <label class="plat"><span class="so-leitor">Plataforma</span>
        <select id="f-plat">
          <option value="">Todas as plataformas</option>
          ${d.plataformas.map((p) => `<option value="${esc(slugPl(p.nome))}">${esc(p.nome)} (${p.qtd})</option>`).join('\n          ')}
        </select>
      </label>
    </div>
    <p class="so-leitor" id="f-aviso" role="status" aria-live="polite"></p>
  </section>

  ${AREAS.map((a, n) => tile(a, d, n)).join('\n\n  ')}

  <section class="tile semanas claro" id="semanas" aria-labelledby="t-semanas">
    <p class="sobretitulo">Outras semanas</p>
    <h2 id="t-semanas">Volte no tempo.<br>Ou veja o que vem.</h2>
    <div class="botoes">
      ${d.anterior ? `<a class="pilula" href="${esc(d.anterior.url)}" rel="noopener">Semana anterior</a>` : ''}
      ${d.proxima ? `<a class="pilula cheia" href="${esc(d.proxima.url)}" rel="noopener">Próxima semana</a>` : ''}
    </div>
    <details class="todas">
      <summary><span>Todas as semanas <small>(${d.semanas.length})</small></span></summary>
      <ul>
        ${d.semanas.map((w) => `<li><a href="${esc(w.url)}" rel="noopener"${w.slug === s.slug ? ' aria-current="page"' : ''}>${esc(w.faixa)}</a></li>`).join('\n        ')}
      </ul>
    </details>
  </section>
</main>

<footer class="rodape">
  <div class="rod-in">
    ${creditos(d)}
    <p class="rod-links"><a href="${esc(d.site)}" rel="noopener">Semana</a><a href="${esc(d.catalogo.url)}" rel="noopener">Catálogo</a><a href="${esc(d.creditos.github)}" rel="noopener">GitHub</a></p>
  </div>
</footer>
</body>
</html>
`;
}
