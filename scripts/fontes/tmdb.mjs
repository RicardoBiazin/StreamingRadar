// Coleta no TMDB (API v3). Aceita chave v3 (32 hex, ?api_key=) ou token v4 (eyJ..., Bearer).
// Documentação: https://developer.themoviedb.org/reference

const BASE = 'https://api.themoviedb.org/3';

export async function tmdb(chave, caminho, params = {}) {
  const url = new URL(BASE + caminho);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const headers = { accept: 'application/json' };
  if (chave.startsWith('eyJ')) headers.authorization = 'Bearer ' + chave;
  else url.searchParams.set('api_key', chave);

  for (let t = 1; t <= 4; t++) {
    let res;
    try {
      res = await fetch(url, { headers, signal: AbortSignal.timeout(25000) });
    } catch (e) {
      if (t === 4) throw e;
      await esperar(1000 * t);
      continue;
    }
    if (res.ok) return res.json();
    if (res.status === 404) return null;
    if (res.status === 401) throw new Error('TMDB recusou a chave (401). Confira TMDB_API_KEY.');
    if ((res.status === 429 || res.status >= 500) && t < 4) {
      await esperar(Number(res.headers.get('retry-after') || 0) * 1000 || 1500 * t);
      continue;
    }
    throw new Error(`TMDB ${res.status} em ${caminho}`);
  }
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

export async function emLote(itens, n, fn) {
  const saida = new Array(itens.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, itens.length) }, async () => {
    while (i < itens.length) {
      const k = i++;
      saida[k] = await fn(itens[k], k);
    }
  }));
  return saida;
}

// Lista os ids de um /discover, em ordem de popularidade, até `paginas` páginas.
async function descobrir(chave, tipo, params, paginas) {
  const ids = [];
  for (let p = 1; p <= paginas; p++) {
    const r = await tmdb(chave, `/discover/${tipo}`, {
      language: 'pt-BR', include_adult: 'false', sort_by: 'popularity.desc', page: p, ...params,
    });
    if (!r) break;
    ids.push(...r.results.map((x) => x.id));
    if (p >= r.total_pages) break;
  }
  return [...new Set(ids)];
}

const trailer = (videos) => {
  const v = (videos?.results || []).filter((x) => x.site === 'YouTube' && x.type === 'Trailer');
  return (v.find((x) => x.official) || v[0])?.key || null;
};

const ep = (e) => (e?.air_date ? { data: e.air_date, temporada: e.season_number, episodio: e.episode_number } : null);

const provedores = (wp) => {
  const br = wp?.results?.BR;
  const lista = (a) => (a || []).map((p) => ({ id: p.provider_id, nome: p.provider_name, logo: p.logo_path }));
  return br ? { link: br.link, flatrate: lista(br.flatrate), rent: lista(br.rent), buy: lista(br.buy) } : null;
};

async function detalheFilme(chave, id) {
  const d = await tmdb(chave, `/movie/${id}`, {
    language: 'pt-BR', append_to_response: 'release_dates,videos,watch/providers', include_video_language: 'pt,en,null',
  });
  if (!d) return null;
  const br = d.release_dates?.results?.find((r) => r.iso_3166_1 === 'BR')?.release_dates || [];
  return {
    id: d.id, imdb: d.imdb_id || null, titulo: d.title, original: d.original_title, lingua: d.original_language,
    sinopse: d.overview, poster: d.poster_path, generos: (d.genres || []).map((g) => g.name),
    nota: d.vote_average, votos: d.vote_count, popularidade: d.popularity, duracao: d.runtime || null,
    datas: br.filter((x) => x.release_date).map((x) => ({ tipo: x.type, data: x.release_date.slice(0, 10) })),
    classificacao: br.map((x) => x.certification).find(Boolean) || null,
    trailer: trailer(d.videos), provedores: provedores(d['watch/providers']),
  };
}

async function detalheSerie(chave, id) {
  const d = await tmdb(chave, `/tv/${id}`, {
    language: 'pt-BR', append_to_response: 'videos,watch/providers,external_ids', include_video_language: 'pt,en,null',
  });
  if (!d) return null;
  return {
    id: d.id, imdb: d.external_ids?.imdb_id || null, titulo: d.name, original: d.original_name, lingua: d.original_language,
    sinopse: d.overview, poster: d.poster_path, generos: (d.genres || []).map((g) => g.name),
    nota: d.vote_average, votos: d.vote_count, popularidade: d.popularity,
    primeira: d.first_air_date || null,
    ultimoEp: ep(d.last_episode_to_air), proximoEp: ep(d.next_episode_to_air),
    temporadas: (d.seasons || []).filter((s) => s.air_date).map((s) => ({ n: s.season_number, data: s.air_date })),
    canais: (d.networks || []).map((n) => n.name),
    trailer: trailer(d.videos), provedores: provedores(d['watch/providers']),
  };
}

export async function coletarTudo(chave, { de, ate, paginas = {} }) {
  const pg = { cinema: 25, filmes: 10, series: 10, ...paginas };
  const lote = 8;

  const idsCinema = await descobrir(chave, 'movie', {
    region: 'BR', with_release_type: '2|3', 'release_date.gte': de, 'release_date.lte': ate,
  }, pg.cinema);
  const idsFilmes = await descobrir(chave, 'movie', {
    region: 'BR', with_release_type: '4|5', 'release_date.gte': de, 'release_date.lte': ate,
  }, pg.filmes);
  const idsSeries = await descobrir(chave, 'tv', {
    watch_region: 'BR', with_watch_monetization_types: 'flatrate', timezone: 'America/Sao_Paulo',
    'air_date.gte': de, 'air_date.lte': ate,
  }, pg.series);
  // Séries novas (1ª temporada) entram pelo first_air_date, que o air_date nem sempre cobre.
  const idsSeriesNovas = await descobrir(chave, 'tv', {
    watch_region: 'BR', with_watch_monetization_types: 'flatrate', timezone: 'America/Sao_Paulo',
    'first_air_date.gte': de, 'first_air_date.lte': ate,
  }, 5);

  // Por plataforma: a lista global por popularidade deixa de fora as plataformas menores
  // (Mercado Play, Claro, Looke, Pluto...). Cada provedor é consultado sozinho.
  const provs = await provedoresBR(chave);
  const idsFilmesPlat = new Set(), idsSeriesPlat = new Set();
  await emLote(provs, 5, async (p) => {
    const base = { watch_region: 'BR', with_watch_providers: p.id, with_watch_monetization_types: 'flatrate' };
    const f = await descobrir(chave, 'movie', {
      ...base, region: 'BR', with_release_type: '1|4|5|6', 'release_date.gte': de, 'release_date.lte': ate,
    }, 5);
    const s1 = await descobrir(chave, 'tv', { ...base, timezone: 'America/Sao_Paulo', 'air_date.gte': de, 'air_date.lte': ate }, 8);
    const s2 = await descobrir(chave, 'tv', { ...base, timezone: 'America/Sao_Paulo', 'first_air_date.gte': de, 'first_air_date.lte': ate }, 4);
    f.forEach((id) => idsFilmesPlat.add(id));
    [...s1, ...s2].forEach((id) => idsSeriesPlat.add(id));
  });

  // Um filme pode estar em várias listas: o detalhe é buscado uma vez só.
  const listaFilmes = [...new Set([...idsFilmes, ...idsFilmesPlat])];
  const todosFilmes = [...new Set([...idsCinema, ...listaFilmes])];
  const mapa = new Map();
  await emLote(todosFilmes, lote, async (id) => { mapa.set(id, await detalheFilme(chave, id)); });
  const idsTodasSeries = [...new Set([...idsSeries, ...idsSeriesNovas, ...idsSeriesPlat])];
  const series = (await emLote(idsTodasSeries, lote, (id) => detalheSerie(chave, id))).filter(Boolean);

  return {
    cinema: idsCinema.map((id) => mapa.get(id)).filter(Boolean),
    filmes: listaFilmes.map((id) => mapa.get(id)).filter(Boolean),
    series,
    provedores: provs.map((p) => p.nome),
  };
}

// Provedores do Brasil (filmes e séries), sem as variantes (canais da Amazon/Apple, com anúncios)
// e sem as lojas de aluguel/compra, que não têm catálogo por assinatura.
const VARIANTE = /with ads|\bchannel\b|\bpremium\b|\bstore\b|amazon video|justwatch/i;
export async function provedoresBR(chave) {
  const [m, t] = await Promise.all([
    tmdb(chave, '/watch/providers/movie', { watch_region: 'BR', language: 'pt-BR' }),
    tmdb(chave, '/watch/providers/tv', { watch_region: 'BR', language: 'pt-BR' }),
  ]);
  const mapa = new Map();
  for (const p of [...(m?.results || []), ...(t?.results || [])]) {
    if (!VARIANTE.test(p.provider_name)) mapa.set(p.provider_id, { id: p.provider_id, nome: p.provider_name, prio: p.display_priorities?.BR ?? 99 });
  }
  return [...mapa.values()].sort((a, b) => a.prio - b.prio).slice(0, 80);
}

// Catálogo completo: tudo que está disponível por assinatura, grátis ou com anúncios no Brasil,
// por plataforma (discover limita a 500 páginas por consulta; a maior plataforma tem ~5 mil filmes).
// Cada item vira uma linha compacta: [tipo(0 filme|1 série), id, título, ano, nota, votos, poster, gêneros].
export async function coletarCatalogo(chave, provs, log = () => {}) {
  const generos = {};
  for (const t of ['movie', 'tv']) {
    const g = await tmdb(chave, `/genre/${t}/list`, { language: 'pt-BR' });
    for (const x of g?.genres || []) generos[x.id] = x.name;
  }
  const consultas = provs.flatMap((p) => ['movie', 'tv'].map((t) => ({ p, t, paginas: new Map() })));
  const params = (c, page) => ({
    language: 'pt-BR', include_adult: 'false', sort_by: 'popularity.desc', watch_region: 'BR',
    with_watch_providers: c.p.id, with_watch_monetization_types: 'flatrate|free|ads', page,
  });
  const primeiras = await emLote(consultas, 8, (c) => tmdb(chave, `/discover/${c.t}`, params(c, 1)));
  const tarefas = [];
  consultas.forEach((c, i) => {
    c.paginas.set(1, primeiras[i]?.results || []);
    for (let pg = 2; pg <= Math.min(primeiras[i]?.total_pages || 1, 500); pg++) tarefas.push({ c, pg });
  });
  log(`${consultas.length} consultas, ${tarefas.length} páginas extras`);
  let falhas = 0;
  await emLote(tarefas, 8, async ({ c, pg }) => {
    try { c.paginas.set(pg, (await tmdb(chave, `/discover/${c.t}`, params(c, pg)))?.results || []); }
    catch { falhas++; }
  });
  if (falhas > tarefas.length * 0.02) throw new Error(`${falhas} páginas do catálogo falharam`);

  const linha = (c, r) => {
    const data = c.t === 'movie' ? r.release_date : r.first_air_date;
    return [
      c.t === 'movie' ? 0 : 1, r.id, c.t === 'movie' ? r.title : r.name, data ? Number(data.slice(0, 4)) : null,
      r.vote_count > 0 ? Math.round(r.vote_average * 10) / 10 : null, r.vote_count || 0,
      (r.poster_path || '/').slice(1), r.genre_ids || [],
    ];
  };
  const plataformas = provs.map((p) => {
    const vistos = new Set(), itens = [];
    for (const c of consultas.filter((x) => x.p === p)) {
      for (const pg of [...c.paginas.keys()].sort((a, b) => a - b)) {
        for (const r of c.paginas.get(pg)) {
          const k = c.t + r.id;
          if (!vistos.has(k)) { vistos.add(k); itens.push(linha(c, r)); }
        }
      }
    }
    // filmes e séries intercalados por popularidade seria perder a ordem; mantém a de cada consulta
    return { id: p.id, nome: p.nome, itens };
  }).filter((p) => p.itens.length);
  return { generos, plataformas };
}
