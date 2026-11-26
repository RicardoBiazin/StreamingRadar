// Base dos modelos de layout: carrega os dados reais da semana atual e entrega tudo pronto
// para cada modelo desenhar a página do seu jeito. Os modelos NÃO alteram public/.

import { lerJSON, esc, slug, cortar, hojeBR, segunda, somarDias, slugSemana, faixa, diaLongo, diaMini, VERSAO, SITE } from '../scripts/util.mjs';
import { REDES, linkRede } from '../src/redes.mjs';
import { sitePlataforma } from '../src/plataformas.mjs';
import { seletorTemas, urlTema, urlCatalogo } from '../src/temas.mjs';

export { esc, cortar, VERSAO, SITE };
export const IMG = 'https://image.tmdb.org/t/p/';

const nota1 = (n) => n.toFixed(1).replace('.', ',');

/** Normaliza um item de lançamento para o que um modelo precisa. */
function item(i, notas, hoje) {
  const n = i.imdb ? notas[i.imdb] : null;
  const q = encodeURIComponent(i.original || i.titulo);
  const assinatura = i.plataformas.filter((p) => p.tipo === 'assinatura');
  const lista = assinatura.length ? assinatura : i.plataformas;
  const tmdbUrl = `https://www.themoviedb.org/${i.tipo === 'serie' ? 'tv' : 'movie'}/${i.tmdb}`;
  return {
    id: i.id,
    tmdb: i.tmdb,
    tipo: i.tipo, // 'cinema' | 'filme' | 'serie'
    tipoRotulo: i.tipo === 'cinema' ? 'Cinema' : i.tipo === 'serie' ? 'Série' : 'Filme',
    titulo: i.titulo,
    original: i.original,
    data: i.data, // AAAA-MM-DD
    dataMini: diaMini(i.data), // "ter 24 nov"
    dataLonga: diaLongo(i.data), // "terça-feira, 24 de novembro"
    generos: i.generos,
    generosSlug: i.generos.map((g) => slug(g)), // para filtros: data-gen="drama comedia"
    nota: i.nota, // número ou null (nota TMDB)
    notaTxt: i.nota ? nota1(i.nota) : null,
    votos: i.votos,
    sinopse: i.sinopse,
    sinopseCurta: cortar(i.sinopse, 220),
    poster: i.poster ? `${IMG}w342${i.poster}` : null, // pôster 342 px de largura
    posterGrande: i.poster ? `${IMG}w500${i.poster}` : null,
    inicial: i.titulo.slice(0, 1).toUpperCase(),
    duracao: i.duracao || null,
    classificacao: i.classificacao || null,
    estreiaTxt: i.tipo === 'serie' ? (i.temporada === 1 ? 'Estreia da série' : `Estreia da ${i.temporada}ª temporada`) : null,
    // streaming: onde assistir (assinatura primeiro). logo: ícone 45 px ou null.
    plataformas: lista.map((p) => ({
      nome: p.nome,
      tipo: p.tipo, // 'assinatura' | 'aluguel' | 'compra'
      logo: p.logo ? `${IMG}w45${p.logo}` : null,
      href: sitePlataforma(p.nome) || i.justwatch || tmdbUrl,
    })),
    semPlataforma: i.tipo !== 'cinema' && !lista.length, // mostrar "Plataforma ainda não informada"
    canais: i.canais || [],
    // cinema: programação de cada rede (links reais)
    redes: i.tipo === 'cinema' ? REDES.map((r) => ({ nome: r.nome, href: linkRede(r, i.data, hoje) })) : [],
    tmdbUrl,
    trailerUrl: i.trailer ? `https://www.youtube.com/watch?v=${i.trailer}` : null,
    justwatchUrl: i.justwatch || null,
    // notas de críticos (só existem com OMDB_API_KEY): { imdb, rt, mc } ou null
    selos: n ? {
      imdb: n.imdb != null ? { txt: nota1(n.imdb), href: `https://www.imdb.com/title/${i.imdb}/` } : null,
      rt: n.rt != null ? { txt: `${n.rt}%`, valor: n.rt, href: `https://www.rottentomatoes.com/search?search=${q}` } : null,
      mc: n.mc != null ? { txt: String(n.mc), valor: n.mc, href: `https://www.metacritic.com/search/${q}/` } : null,
    } : null,
  };
}

// leitura única: o site gera as mesmas páginas para várias semanas e temas
let cache = null;
function fonte() {
  if (cache) return cache;
  const lanc = lerJSON('dados/lancamentos.json');
  if (!lanc) throw new Error('Sem dados/lancamentos.json: rode `npm run atualizar` antes de gerar os modelos.');
  const hoje = hojeBR();
  const notas = lerJSON('dados/notas.json', {});
  const cat = lerJSON('dados/catalogo/bruto.json');
  cache = {
    lanc, hoje,
    itens: lanc.itens.map((i) => item(i, notas, hoje)),
    catalogo: {
      plataformas: cat ? cat.plataformas.length : null,
      titulos: cat ? new Set(cat.plataformas.flatMap((p) => p.itens.map((i) => `${i[0]}-${i[1]}`))).size : null,
    },
  };
  return cache;
}

/**
 * Dados reais para renderizar um modelo.
 * `slug`: semana a mostrar (padrão: a atual). `tema`: quando o modelo é um tema do site (/instagram/, /lens/),
 * os links de semana ficam dentro do tema, "Semana" volta ao início do tema e o seletor de temas vai em `d.seletorTemas`.
 */
export function carregar({ slug: pedido = null, tema = null } = {}) {
  const { lanc, hoje, itens, catalogo } = fonte();

  const semanas = [];
  for (let s = segunda(lanc.de); s <= segunda(lanc.ate); s = somarDias(s, 7)) {
    const sl = slugSemana(s);
    semanas.push({ segunda: s, slug: sl, faixa: faixa(s), url: tema ? urlTema(tema, sl) : `${SITE}/semana/${sl}.html` });
  }
  const atualSeg = segunda(hoje);
  const k = Math.max(0, semanas.findIndex((w) => (pedido ? w.slug === pedido : w.segunda === atualSeg)));
  const sem = semanas[k];
  const dela = itens.filter((_, idx) => lanc.itens[idx].segunda === sem.segunda);

  // gêneros e plataformas da semana, do mais frequente ao menos
  const contGen = new Map();
  for (const i of dela) for (const g of i.generos) contGen.set(g, (contGen.get(g) || 0) + 1);
  const generos = [...contGen].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR')).map(([nome, qtd]) => ({ nome, slug: slug(nome), qtd }));
  const contPl = new Map();
  for (const i of dela) for (const p of i.plataformas) contPl.set(p.nome, (contPl.get(p.nome) || 0) + 1);
  const plataformas = [...contPl].sort((a, b) => b[1] - a[1]).map(([nome, qtd]) => ({ nome, slug: slug(nome), qtd, href: sitePlataforma(nome) }));

  // dias da semana com os itens (para agrupar por data)
  const dias = [...new Set(dela.map((i) => i.data))].sort().map((data) => ({
    data, rotulo: dela.find((i) => i.data === data).dataLonga, mini: dela.find((i) => i.data === data).dataMini, itens: dela.filter((i) => i.data === data),
  }));

  return {
    versao: VERSAO,
    site: tema ? urlTema(tema) : SITE, // "Semana" no menu: o início do tema (ou o site oficial)
    tema,
    seletorTemas: tema ? seletorTemas(tema, sem.slug) : '', // menu "Tema: Padrão · Instagram · Lens"
    hoje,
    semana: {
      slug: sem.slug, faixa: sem.faixa, numero: sem.slug.split('-w')[1], ano: sem.slug.slice(0, 4),
      itens: dela,
      cinema: dela.filter((i) => i.tipo === 'cinema'),
      filmes: dela.filter((i) => i.tipo === 'filme'),
      series: dela.filter((i) => i.tipo === 'serie'),
      dias,
    },
    anterior: semanas[k - 1] || null, // { slug, faixa, url } da semana real anterior
    proxima: semanas[k + 1] || null,
    semanas, // todas: { slug, faixa, url }
    generos, // [{ nome, slug, qtd }]
    plataformas, // [{ nome, slug, qtd, href }]
    redes: REDES.map((r) => ({ nome: r.nome, href: r.cartaz })),
    catalogo: { url: tema ? urlCatalogo(tema) : `${SITE}/catalogo/`, ...catalogo },
    totais: { itens: dela.length, cinema: dela.filter((i) => i.tipo === 'cinema').length, filmes: dela.filter((i) => i.tipo === 'filme').length, series: dela.filter((i) => i.tipo === 'serie').length },
    // créditos obrigatórios (todo modelo deve mostrar no rodapé)
    creditos: {
      tmdb: 'Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.',
      justwatch: 'Onde assistir: dados do JustWatch, via TMDB.',
      omdb: 'Notas do IMDb, Rotten Tomatoes e Metacritic via OMDb API, quando disponíveis.',
      licenca: { txt: 'licença MIT', href: 'https://github.com/RicardoBiazin/StreamingRadar/blob/main/LICENSE' },
      github: 'https://github.com/RicardoBiazin/StreamingRadar',
    },
  };
}

/** <head> padrão do modelo: noindex e o CSS próprio em /<id>/estilo.css */
export function head(id, d, { titulo = 'Streaming Radar', extra = '' } = {}) {
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(titulo)}</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230b1f1c'/%3E%3Ccircle cx='32' cy='32' r='20' fill='none' stroke='%234fd1bd' stroke-width='4'/%3E%3Cpath d='M32 32 L48 20' stroke='%234fd1bd' stroke-width='4' stroke-linecap='round'/%3E%3Ccircle cx='32' cy='32' r='3.5' fill='%234fd1bd'/%3E%3C/svg%3E">
<link rel="stylesheet" href="/${id}/estilo.css?v=${d.versao}">
${extra}</head>`;
}

/** Rodapé de créditos padrão (cada modelo pode estilizar a classe .creditos). */
export function creditos(d) {
  const c = d.creditos;
  return `<div class="creditos"><p>Dados do <a href="https://www.themoviedb.org/" rel="noopener">TMDB</a> e do <a href="https://www.justwatch.com/br" rel="noopener">JustWatch</a>. ${esc(c.tmdb)} ${esc(c.omdb)}</p>
<p>Código aberto sob a <a href="${c.licenca.href}" rel="noopener">${c.licenca.txt}</a>: <a href="${c.github}" rel="noopener">GitHub</a>. v${d.versao}. ${d.tema ? 'Tema do Streaming Radar: mesmos dados do tema Padrão.' : 'Modelo de layout: não é o site oficial.'}</p></div>`;
}
