// Modelo "whatsapp": a semana como uma conversa. Cada lançamento é um balão de mensagem,
// plataformas viram respostas rápidas, redes de cinema viram uma lista de botões.
import { esc, head, creditos } from '../_base.mjs';

export const meta = {
  nome: 'Conversa de mensagens',
  inspiracao: 'WhatsApp (whatsapp.com)',
  descricao: 'Cada lançamento é um balão numa conversa, com respostas rápidas para as plataformas, separadores de data e lista de semanas ao lado.',
};

const ID = 'whatsapp';

const sprite = `<svg class="sprite" width="0" height="0" aria-hidden="true" focusable="false"><defs>
<symbol id="i-radar" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="currentColor"/><g fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M16 16 L23.5 8.5"/><path d="M9.2 22.8a9.6 9.6 0 0 1 0-13.6" opacity=".9"/><path d="M5.6 26.4a14.7 14.7 0 0 1 0-20.8" opacity=".55"/></g><circle cx="16" cy="16" r="2.4" fill="#fff"/><circle cx="23.5" cy="8.5" r="1.9" fill="#fff"/></symbol>
<symbol id="i-tiques" viewBox="0 0 18 11"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 5.8 4.6 9.4 11.4 1.6"/><path d="M7.2 8.6l.8.8L15.8 1.6"/></g></symbol>
<symbol id="i-play" viewBox="0 0 16 16"><path d="M4 2.6v10.8a.6.6 0 0 0 .9.5l8.6-5.4a.6.6 0 0 0 0-1L4.9 2.1a.6.6 0 0 0-.9.5Z" fill="currentColor"/></symbol>
<symbol id="i-ext" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3H3.8A.8.8 0 0 0 3 3.8v8.4a.8.8 0 0 0 .8.8h8.4a.8.8 0 0 0 .8-.8V9.5"/><path d="M9.5 3H13v3.5M13 3 7.5 8.5"/></g></symbol>
<symbol id="i-esq" viewBox="0 0 16 16"><path d="M10 2.5 4.5 8 10 13.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-dir" viewBox="0 0 16 16"><path d="M6 2.5 11.5 8 6 13.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-estrela" viewBox="0 0 16 16"><path d="m8 1.6 1.9 4.2 4.5.5-3.4 3 1 4.5L8 11.5l-4 2.3 1-4.5-3.4-3 4.5-.5L8 1.6Z" fill="currentColor"/></symbol>
<symbol id="i-lista" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5.5 4h8M5.5 8h8M5.5 12h8"/><path d="M2.4 4h.1M2.4 8h.1M2.4 12h.1" stroke-width="2.2"/></g></symbol>
<symbol id="i-cinema" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="m3 7 2.2-3.6 3.6 1.2L7.2 8M10.6 4.6l3.6 1.2L12.6 8M16 5.8l3.4 1.2"/></g></symbol>
<symbol id="i-filme" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m10 8.6 5 3.4-5 3.4Z"/></g></symbol>
<symbol id="i-serie" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></g></symbol>
</defs></svg>`;

const ico = (n, c = 'ico') => `<svg class="${c}" aria-hidden="true" focusable="false"><use href="#i-${n}"/></svg>`;
const tiques = '<svg class="tiques" viewBox="0 0 18 11" aria-hidden="true" focusable="false"><use href="#i-tiques"/></svg>';

const dur = (m) => (m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}` : `${m} min`);

function selos(i) {
  if (!i.selos) return '';
  const l = [];
  if (i.selos.imdb) l.push(`<a class="selo" href="${esc(i.selos.imdb.href)}" rel="noopener">IMDb <b>${esc(i.selos.imdb.txt)}</b></a>`);
  if (i.selos.rt) l.push(`<a class="selo" href="${esc(i.selos.rt.href)}" rel="noopener">Rotten Tomatoes <b>${esc(i.selos.rt.txt)}</b></a>`);
  if (i.selos.mc) l.push(`<a class="selo" href="${esc(i.selos.mc.href)}" rel="noopener">Metacritic <b>${esc(i.selos.mc.txt)}</b></a>`);
  return l.length ? `<p class="selos">${l.join('')}</p>` : '';
}

function mensagem(i) {
  const gen = i.generosSlug.join(' ');
  const plat = i.plataformas.map((p) => p.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-')).join(' ');
  const remet = i.tipo === 'cinema' ? 'Cinema' : i.tipo === 'serie' ? 'Série' : 'Filme no streaming';
  const meta = [i.generos.join(', '), i.duracao ? dur(i.duracao) : '', i.classificacao ? (i.classificacao === 'L' ? 'Livre' : `${i.classificacao} anos`) : '', i.estreiaTxt || ''].filter(Boolean);
  const poster = i.poster
    ? `<img class="poster" src="${esc(i.poster)}" width="342" height="513" loading="lazy" decoding="async" alt="Pôster de ${esc(i.titulo)}">`
    : `<div class="poster sem" aria-hidden="true">${esc(i.inicial)}</div>`;
  const truncada = i.sinopse && i.sinopseCurta !== i.sinopse;
  const sin = i.sinopse
    ? `<div class="sinopse"><p>${esc(i.sinopseCurta)}</p>${truncada ? `<details class="mais"><summary>Ler sinopse completa</summary><p>${esc(i.sinopse)}</p></details>` : ''}</div>`
    : '';
  const links = [
    i.trailerUrl ? `<a href="${esc(i.trailerUrl)}" rel="noopener">${ico('play')}Trailer</a>` : '',
    `<a href="${esc(i.tmdbUrl)}" rel="noopener">${ico('ext')}TMDB</a>`,
    i.justwatchUrl ? `<a href="${esc(i.justwatchUrl)}" rel="noopener">${ico('ext')}JustWatch</a>` : '',
  ].filter(Boolean).join('');

  let respostas = '';
  if (i.tipo === 'cinema') {
    respostas = `<details class="programacao"><summary>${ico('lista')}<span>Programação nas redes</span></summary><ul>${i.redes.map((r) => `<li><a href="${esc(r.href)}" rel="noopener"><span>${esc(r.nome)}</span>${ico('ext')}</a></li>`).join('')}</ul></details>`;
  } else if (i.semPlataforma) {
    respostas = '<p class="sem-plat">Plataforma ainda não informada</p>';
  } else {
    respostas = i.plataformas.map((p) => `<a class="resposta" href="${esc(p.href)}" rel="noopener">${p.logo ? `<img src="${esc(p.logo)}" width="22" height="22" alt="" loading="lazy">` : ''}<span>${esc(p.nome)}</span></a>`).join('');
    if (i.canais.length) respostas += `<p class="canais">Canais: ${esc(i.canais.join(', '))}</p>`;
  }

  return `<div class="msg" data-gen="${esc(gen)}" data-plat="${esc(plat)}" id="i-${esc(i.id)}">
<div class="balao in">
<p class="remetente r-${esc(i.tipo)}">${esc(remet)}</p>
<div class="corpo">${poster}<div class="cab"><h4>${esc(i.titulo)}</h4>${i.original && i.original !== i.titulo ? `<p class="original">${esc(i.original)}</p>` : ''}${meta.length ? `<p class="meta">${esc(meta.join(' · '))}</p>` : ''}${selos(i)}</div></div>
${sin}
<p class="links">${links}</p>
<p class="canto">${i.notaTxt ? `<span class="nota"><span class="vh">Nota TMDB </span>${ico('estrela')}${esc(i.notaTxt)}</span>` : ''}<time datetime="${esc(i.data)}">${esc(i.dataMini)}</time>${tiques}</p>
</div>
<div class="respostas">${respostas}</div>
</div>`;
}

function porDia(itens, hoje) {
  const m = new Map();
  for (const i of [...itens].sort((a, b) => a.data.localeCompare(b.data))) {
    if (!m.has(i.data)) m.set(i.data, []);
    m.get(i.data).push(i);
  }
  return [...m].map(([data, l]) => `<div class="grupo-dia">
<h3 class="dia"><time datetime="${esc(data)}">${data === hoje ? '<b>Hoje</b> · ' : ''}${esc(l[0].dataLonga)}</time></h3>
${l.map(mensagem).join('\n')}
</div>`).join('\n');
}

function secao(id, icone, titulo, pergunta, lista, hoje) {
  return `<section class="secao" id="${id}" data-secao aria-labelledby="h-${id}">
<div class="secao-cab"><span class="secao-ico">${ico(icone, 'ico g')}</span><h2 id="h-${id}">${esc(titulo)}</h2><p class="secao-conta"><span data-conta>${lista.length}</span> ${lista.length === 1 ? 'lançamento' : 'lançamentos'}</p></div>
<div class="msg enviada"><div class="balao out"><p>${esc(pergunta)}</p><p class="canto"><time>agora</time>${tiques}</p></div></div>
${porDia(lista, hoje)}
<p class="vazio" hidden>Nenhum lançamento deste gênero aqui.</p>
</section>`;
}

export function render(d) {
  const s = d.semana;
  const faixaTxt = `Semana ${s.numero} · ${s.faixa}`;
  const semanas = d.semanas.map((w) => {
    const atual = w.slug === s.slug;
    const num = w.slug.split('-w')[1];
    const previa = atual ? `${s.itens.length} lançamentos: ${d.totais.cinema} cinema, ${d.totais.filmes} filmes, ${d.totais.series} séries` : 'Abrir esta semana no site oficial';
    return `<li><a class="conv${atual ? ' atual' : ''}" href="${atual ? '#conversa' : esc(w.url)}"${atual ? ' aria-current="page"' : ' rel="noopener"'}>
<span class="av num" aria-hidden="true">${esc(num)}</span>
<span class="conv-txt"><span class="conv-nome">${esc(w.faixa)}</span><span class="conv-previa">${esc(previa)}</span></span>
${atual ? '<span class="conv-aqui">agora</span>' : ''}</a></li>`;
  }).join('\n');

  const chips = d.generos.map((g) => `<button type="button" class="chip" data-g="${esc(g.slug)}" aria-pressed="false">${esc(g.nome)} <small>${g.qtd}</small></button>`).join('');

  const corpo = `<a class="pular" href="#conversa">Pular para a conversa</a>
${sprite}
<div class="app">
<nav class="lateral" id="semanas" aria-label="Semanas">
<div class="lat-topo">
<a class="marca" href="${esc(d.site)}" rel="noopener"><span class="av marca-av">${ico('radar', 'ico-radar')}</span><span class="marca-txt"><strong>Streaming Radar</strong><small>v${esc(d.versao)}</small></span></a>
<a class="fechar" href="#conversa" data-fechar aria-label="Voltar para a conversa">${ico('esq')}</a>
</div>
<p class="lat-titulo">Conversas por semana</p>
<ul class="lista-semanas">
${semanas}
</ul>
<p class="lat-rodape"><a href="${esc(d.site)}" rel="noopener">Semana</a> · <a href="${esc(d.catalogo.url)}" rel="noopener">Catálogo</a></p>
</nav>

<main class="conversa" id="conversa" tabindex="-1">
<header class="barra">
<a class="voltar" href="#semanas" data-abrir aria-label="Ver todas as semanas">${ico('lista')}</a>
<span class="av marca-av">${ico('radar', 'ico-radar')}</span>
<p class="barra-txt"><strong>Streaming Radar <span class="ver">v${esc(d.versao)}</span></strong><small>${esc(faixaTxt)}</small></p>
<span class="barra-nav">
${d.anterior ? `<a class="seta" href="${esc(d.anterior.url)}" rel="noopener" aria-label="Semana anterior: ${esc(d.anterior.faixa)}">${ico('esq')}</a>` : ''}
${d.proxima ? `<a class="seta" href="${esc(d.proxima.url)}" rel="noopener" aria-label="Próxima semana: ${esc(d.proxima.faixa)}">${ico('dir')}</a>` : ''}
</span>
<div class="filtros" data-filtros hidden role="group" aria-label="Filtrar por gênero">
<button type="button" class="chip" data-g="" aria-pressed="true">Todos <small>${s.itens.length}</small></button>${chips}
</div>
</header>

<div class="chat">
<section class="intro" aria-labelledby="titulo">
<p class="dia"><span>${esc(s.ano)}</span></p>
<h1 id="titulo">Semana ${esc(s.numero)}<span>${esc(s.faixa)}</span></h1>
<p class="aviso">${ico('radar', 'ico-radar')} Cinema, filmes no streaming e séries que estreiam nesta semana, com dados do TMDB e do JustWatch. Modelo de layout: não é o site oficial.</p>
<p class="atalhos">
<a class="pilula cheia" href="#cinema">Cinema <small>${d.totais.cinema}</small></a>
<a class="pilula cheia" href="#filmes">Filmes <small>${d.totais.filmes}</small></a>
<a class="pilula cheia" href="#series">Séries <small>${d.totais.series}</small></a>
</p>
<p class="atalhos">
${d.anterior ? `<a class="pilula" href="${esc(d.anterior.url)}" rel="noopener">${ico('esq')}Semana anterior</a>` : ''}
${d.proxima ? `<a class="pilula" href="${esc(d.proxima.url)}" rel="noopener">Próxima semana${ico('dir')}</a>` : ''}
<a class="pilula" href="${esc(d.site)}" rel="noopener">Semana</a>
<a class="pilula" href="${esc(d.catalogo.url)}" rel="noopener">Catálogo</a>
</p>
<p class="estado" data-estado role="status" aria-live="polite"></p>
</section>

${secao('cinema', 'cinema', 'Cinema', 'O que estreia nos cinemas?', s.cinema, d.hoje)}
${secao('filmes', 'filme', 'Filmes', 'E filmes novos no streaming?', s.filmes, d.hoje)}
${secao('series', 'serie', 'Séries', 'Alguma série estreando?', s.series, d.hoje)}
</div>

<footer class="rodape">
${creditos(d)}
</footer>
</main>
</div>
<script src="/${ID}/filtro.js" defer></script>`;

  return `<!doctype html>
<html lang="pt-BR">
${head(ID, d, { titulo: `Streaming Radar · ${faixaTxt}` })}
<body>
${corpo}
</body>
</html>
`;
}
