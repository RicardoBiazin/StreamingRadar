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
    id: d.id, titulo: d.title, original: d.original_title, lingua: d.original_language,
    sinopse: d.overview, poster: d.poster_path, generos: (d.genres || []).map((g) => g.name),
    nota: d.vote_average, votos: d.vote_count, popularidade: d.popularity, duracao: d.runtime || null,
    datas: br.filter((x) => x.release_date).map((x) => ({ tipo: x.type, data: x.release_date.slice(0, 10) })),
    classificacao: br.map((x) => x.certification).find(Boolean) || null,
    trailer: trailer(d.videos), provedores: provedores(d['watch/providers']),
  };
}

async function detalheSerie(chave, id) {
  const d = await tmdb(chave, `/tv/${id}`, {
    language: 'pt-BR', append_to_response: 'videos,watch/providers', include_video_language: 'pt,en,null',
  });
  if (!d) return null;
  return {
    id: d.id, titulo: d.name, original: d.original_name, lingua: d.original_language,
    sinopse: d.overview, poster: d.poster_path, generos: (d.genres || []).map((g) => g.name),
    nota: d.vote_average, votos: d.vote_count, popularidade: d.popularity,
    primeira: d.first_air_date || null,
    temporadas: (d.seasons || []).filter((s) => s.air_date).map((s) => ({ n: s.season_number, data: s.air_date })),
    canais: (d.networks || []).map((n) => n.name),
    trailer: trailer(d.videos), provedores: provedores(d['watch/providers']),
  };
}

export async function coletarTudo(chave, { de, ate, paginas = {} }) {
  const pg = { cinema: 8, filmes: 6, series: 6, ...paginas };
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

  // Um filme pode estar nas duas listas: o detalhe é buscado uma vez só.
  const todosFilmes = [...new Set([...idsCinema, ...idsFilmes])];
  const mapa = new Map();
  await emLote(todosFilmes, lote, async (id) => { mapa.set(id, await detalheFilme(chave, id)); });
  const series = (await emLote(idsSeries, lote, (id) => detalheSerie(chave, id))).filter(Boolean);

  return {
    cinema: idsCinema.map((id) => mapa.get(id)).filter(Boolean),
    filmes: idsFilmes.map((id) => mapa.get(id)).filter(Boolean),
    series,
  };
}
