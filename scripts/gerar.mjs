// Gera public/: uma página por semana (/semana/AAAA-wNN.html), index.html (semana atual),
// sitemap, robots, favicon e assets.

import { cpSync, rmSync, mkdirSync } from 'node:fs';
import {
  lerJSON, gravarTexto, caminho, esc, slug, cortar, hojeBR, segunda, somarDias, slugSemana, diaLongo,
  faixa, diaMini, VERSAO, SITE, EXEMPLO,
} from './util.mjs';
import { pagina } from '../src/layout.mjs';
import { REDES, linkRede } from '../src/redes.mjs';
import { sitePlataforma } from '../src/plataformas.mjs';
import { gerarCatalogo } from '../src/catalogo.mjs';

const dados = lerJSON('dados/lancamentos.json');
if (!dados) {
  console.error('Sem dados/lancamentos.json: rode `npm run normalizar` primeiro.');
  process.exit(1);
}
const notas = lerJSON('dados/notas.json', {});
const hoje = hojeBR();
const IMG = 'https://image.tmdb.org/t/p/';

// ---------- semanas da janela ----------
const semanas = [];
for (let s = segunda(dados.de); s <= segunda(dados.ate); s = somarDias(s, 7)) {
  semanas.push({ segunda: s, slug: slugSemana(s), itens: dados.itens.filter((i) => i.segunda === s) });
}
const atual = semanas.find((w) => w.segunda === segunda(hoje)) || semanas.find((w) => w.segunda > hoje) || semanas.at(-1);
const url = (w) => `/semana/${w.slug}.html`;

// ---------- cartões ----------
const SECOES = [
  { tipo: 'cinema', id: 'cinema', titulo: 'No cinema', vazio: 'Nenhuma estreia de cinema coletada para esta semana.' },
  { tipo: 'filme', id: 'filmes', titulo: 'Filmes no streaming', vazio: 'Nenhum filme novo com plataforma informada nesta semana.' },
  { tipo: 'serie', id: 'series', titulo: 'Séries', vazio: 'Nenhuma estreia de série ou temporada coletada para esta semana.' },
];

const tituloLink = (i) => `https://www.themoviedb.org/${i.tipo === 'serie' ? 'tv' : 'movie'}/${i.tmdb}`;

function chipPlataforma(p, i) {
  const href = sitePlataforma(p.nome) || i.justwatch;
  const logo = p.logo ? `<img src="${IMG}w45${esc(p.logo)}" alt="" width="20" height="20" loading="lazy" referrerpolicy="no-referrer">` : '';
  const rot = `${logo}<span>${esc(p.nome)}</span>${p.tipo === 'assinatura' ? '' : `<em>${p.tipo}</em>`}`;
  return href ? `<a class="chip" href="${esc(href)}" rel="noopener">${rot}</a>` : `<span class="chip">${rot}</span>`;
}

function cartao(i) {
  const plat = i.plataformas.filter((p) => p.tipo === 'assinatura');
  const platSlugs = i.plataformas.map((p) => slug(p.nome)).join(' ');
  const meta = [
    i.tipo === 'serie' ? (i.temporada === 1 ? 'Estreia da série' : `Estreia da ${i.temporada}ª temporada`) : null,
    ...i.generos.slice(0, 3),
    i.duracao ? `${i.duracao} min` : null,
    i.classificacao ? `Classif. ${i.classificacao}` : null,
  ].filter(Boolean);
  const poster = i.poster
    ? `<img class="poster" src="${IMG}w342${esc(i.poster)}" alt="Pôster de ${esc(i.titulo)}" width="342" height="513" loading="lazy" referrerpolicy="no-referrer">`
    : `<div class="poster sem" aria-hidden="true">${esc(i.titulo.slice(0, 1))}</div>`;

  let onde = '';
  if (i.tipo === 'cinema') {
    onde = `<div class="onde"><span class="rot">Programação nas redes</span>${REDES.map((r) =>
      `<a class="chip rede" href="${esc(linkRede(r, i.data, hoje))}" rel="noopener">${esc(r.nome)}</a>`).join('')}</div>`;
  } else {
    const lista = (plat.length ? plat : i.plataformas);
    if (!lista.length) onde = '<div class="onde"><span class="rot">Plataforma ainda não informada</span></div>';
    else onde = `<div class="onde"><span class="rot">${plat.length ? 'Onde assistir' : 'Aluguel ou compra'}</span>${lista.map((p) => chipPlataforma(p, i)).join('')}</div>`;
    if (i.tipo === 'serie' && i.canais?.length) onde += `<p class="canal">Canal/rede de origem: ${esc(i.canais.join(', '))}</p>`;
  }

  const n = i.imdb ? notas[i.imdb] : null;
  const q = encodeURIComponent(i.original || i.titulo);
  const selos = n ? [
    n.imdb != null ? `<a class="selo imdb" href="https://www.imdb.com/title/${esc(i.imdb)}/" rel="noopener" title="IMDb${n.votos ? ', ' + n.votos.toLocaleString('pt-BR') + ' votos' : ''}"><b>IMDb</b> ${n.imdb.toFixed(1).replace('.', ',')}</a>` : '',
    n.rt != null ? `<a class="selo rt ${n.rt >= 60 ? 'fresco' : 'podre'}" href="https://www.rottentomatoes.com/search?search=${q}" rel="noopener" title="Rotten Tomatoes (crítica)"><b>RT</b> ${n.rt}%</a>` : '',
    n.mc != null ? `<a class="selo mc ${n.mc >= 61 ? 'bom' : n.mc >= 40 ? 'medio' : 'ruim'}" href="https://www.metacritic.com/search/${q}/" rel="noopener" title="Metacritic (Metascore)"><b>MC</b> ${n.mc}</a>` : '',
  ].join('') : '';
  const links = [
    `<a href="${esc(tituloLink(i))}" rel="noopener">TMDB</a>`,
    i.trailer ? `<a href="https://www.youtube.com/watch?v=${esc(i.trailer)}" rel="noopener">Trailer</a>` : null,
    i.justwatch ? `<a href="${esc(i.justwatch)}" rel="noopener">JustWatch</a>` : null,
  ].filter(Boolean).join(' · ');

  return `<article class="card" data-plat="${esc(platSlugs)}">
  <a class="capa" href="${esc(tituloLink(i))}" rel="noopener">${poster}</a>
  <div class="info">
    <p class="quando">${esc(diaMini(i.data))}</p>
    <h3><a href="${esc(tituloLink(i))}" rel="noopener">${esc(i.titulo)}</a>${i.nota ? `<span class="nota" title="${i.votos} votos no TMDB">★ ${i.nota.toFixed(1).replace('.', ',')}</span>` : ''}</h3>
    ${i.original ? `<p class="orig">${esc(i.original)}</p>` : ''}
    <p class="meta">${meta.map(esc).join(' · ')}</p>
    ${selos ? `<p class="selos">${selos}</p>` : ''}
    ${i.sinopse ? `<p class="sinopse">${esc(cortar(i.sinopse, 240))}</p>` : ''}
    ${onde}
    <p class="links">${links}</p>
  </div>
</article>`;
}

function secao(w, s) {
  const itens = w.itens.filter((i) => i.tipo === s.tipo);
  if (!itens.length) return `<section class="bloco" id="${s.id}"><h2>${s.titulo} <span class="qtd">0</span></h2><p class="vazio">${s.vazio}</p></section>`;
  const dias = [...new Set(itens.map((i) => i.data))];
  return `<section class="bloco" id="${s.id}"><h2>${s.titulo} <span class="qtd">${itens.length}</span></h2>
<div class="dias">
${dias.map((d) => `<div class="dia"><h3 class="dia-tit">${esc(diaLongo(d))}</h3><div class="grade">
${itens.filter((i) => i.data === d).map(cartao).join('\n')}
</div></div>`).join('\n')}
</div>
</section>`;
}

// ---------- página da semana ----------
function paginaSemana(w, k, alvo) {
  const ant = semanas[k - 1], prox = semanas[k + 1];
  const nomes = new Map();
  for (const i of w.itens) if (i.tipo !== 'cinema') for (const p of i.plataformas) nomes.set(slug(p.nome), p.nome);
  const opcoes = [...nomes].sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'));
  const qtd = (t) => w.itens.filter((i) => i.tipo === t).length;
  const eAtual = w === atual;

  const corpo = `<div class="semana-nav">
  ${ant ? `<a class="seta" href="${url(ant)}" rel="prev">‹ ${esc(faixa(ant.segunda))}</a>` : '<span class="seta off"></span>'}
  <div class="semana-tit"><h1>${eAtual ? 'Esta semana' : 'Semana'}: ${esc(faixa(w.segunda))}</h1><p>Lançamentos no Brasil · semana ${w.slug.split('-w')[1]} de ${w.slug.slice(0, 4)}</p></div>
  ${prox ? `<a class="seta" href="${url(prox)}" rel="next">${esc(faixa(prox.segunda))} ›</a>` : '<span class="seta off"></span>'}
</div>
<nav class="abas" aria-label="Seções">
  ${SECOES.map((s) => `<a href="#${s.id}">${s.titulo} <span class="qtd">${qtd(s.tipo)}</span></a>`).join('\n  ')}
  <span class="vista" role="group" aria-label="Modo de exibição"><button type="button" data-vista="junto" aria-pressed="true">Todos juntos</button><button type="button" data-vista="dia" aria-pressed="false">Por dia</button></span>
  ${opcoes.length ? `<label class="filtro">Plataforma <select id="f-plat"><option value="">Todas</option>${opcoes.map(([s, n]) => `<option value="${esc(s)}">${esc(n)}</option>`).join('')}</select></label>` : ''}
</nav>
${SECOES.map((s) => secao(w, s)).join('\n')}
<p class="vazio-filtro" id="sem-filtro" hidden>Nada nesta semana para a plataforma escolhida.</p>
<nav class="todas" aria-label="Todas as semanas"><h2>Outras semanas</h2>
${semanas.map((x) => `<a href="${url(x)}"${x === w ? ' aria-current="page"' : ''}>${esc(faixa(x.segunda))}${x === atual ? ' (atual)' : ''}</a>`).join('\n')}
</nav>`;

  const titulo = `Lançamentos de ${faixa(w.segunda)}: cinema, filmes e séries no streaming | Streaming Radar`;
  const descricao = `Estreias da semana de ${faixa(w.segunda)} no Brasil: ${qtd('cinema')} no cinema (com redes), ${qtd('filme')} filmes e ${qtd('serie')} séries no streaming, com plataforma e links.`;
  return pagina({
    titulo, descricao, caminho: alvo, corpo,
    json: alvo === '/' ? { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Streaming Radar', url: SITE + '/', inLanguage: 'pt-BR', description: descricao } : null,
  });
}

// ---------- gravação ----------
rmSync(caminho('public'), { recursive: true, force: true });
mkdirSync(caminho('public'), { recursive: true });
cpSync(caminho('src/assets'), caminho('public/assets'), { recursive: true });
cpSync(caminho('src/favicon.svg'), caminho('public/favicon.svg'));

semanas.forEach((w, k) => gravarTexto(`public${url(w)}`, paginaSemana(w, k, url(w))));
gravarTexto('public/index.html', paginaSemana(atual, semanas.indexOf(atual), '/'));
gravarTexto('public/404.html', pagina({
  titulo: 'Página não encontrada | Streaming Radar', descricao: 'Página não encontrada no Streaming Radar.', caminho: '/404.html',
  corpo: '<div class="semana-tit"><h1>Página não encontrada</h1><p><a href="/">Ver os lançamentos desta semana</a></p></div>',
}));

const cat = gerarCatalogo();
gravarTexto('public/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
const data = (dados.coletadoEm || '').slice(0, 10) || hoje;
gravarTexto('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${SITE}/</loc><lastmod>${data}</lastmod></url>
${semanas.map((w) => `<url><loc>${SITE}${url(w)}</loc><lastmod>${data}</lastmod></url>`).join('\n')}
${cat.paginas.map((u) => `<url><loc>${SITE}${u}</loc><lastmod>${data}</lastmod></url>`).join('\n')}
</urlset>
`);

console.log(`v${VERSAO}${EXEMPLO ? ' (EXEMPLO)' : ''}: ${semanas.length} semanas, semana atual ${atual.slug}, ${dados.itens.length} itens → public/`);
