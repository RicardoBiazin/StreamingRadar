// Detalhe de um filme ou série (elenco, direção, sinopse completa, onde assistir) para o modal
// do site. Netlify Function: a chave do TMDB fica em variável de ambiente do Netlify
// (TMDB_API_KEY), nunca no navegador. Respostas ficam em cache (CDN: 1 dia).
//
// O mesmo `montarDetalhe` é usado pela coleta para gerar os arquivos estáticos dos cartões
// de lançamento (public/detalhe/*.json), que funcionam mesmo sem a função.

const VARIANTE = /with ads|\bchannel\b|\bpremium\b|\bstore\b|amazon video/i;

// Reduz a resposta do TMDB ao que o modal mostra.
export function montarDetalhe(tipo, d) {
  const br = d['watch/providers']?.results?.BR || {};
  const lista = (a) => (a || []).filter((p) => !VARIANTE.test(p.provider_name)).map((p) => ({ n: p.provider_name, l: p.logo_path || null }));
  const yt = (d.videos?.results || []).filter((v) => v.site === 'YouTube' && v.type === 'Trailer');
  const direcao = tipo === 'movie'
    ? (d.credits?.crew || []).filter((c) => c.job === 'Director').map((c) => c.name)
    : (d.created_by || []).map((c) => c.name);
  const data = tipo === 'movie' ? d.release_date : d.first_air_date;
  return {
    tipo,
    id: d.id,
    t: tipo === 'movie' ? d.title : d.name,
    o: (tipo === 'movie' ? d.original_title : d.original_name) || null,
    l: d.tagline || null,
    s: d.overview || null,
    d: data || null,
    r: tipo === 'movie' ? d.runtime || null : (d.episode_run_time || [])[0] || null,
    g: (d.genres || []).map((g) => g.name),
    n: d.vote_count > 0 ? Math.round(d.vote_average * 10) / 10 : null,
    v: d.vote_count || 0,
    dir: [...new Set(direcao)].slice(0, 4),
    el: (d.credits?.cast || []).slice(0, 12).map((c) => ({ n: c.name, p: c.character || null, f: c.profile_path || null })),
    tr: (yt.find((v) => v.official) || yt[0])?.key || null,
    pl: { assinatura: lista([...(br.flatrate || []), ...(br.free || []), ...(br.ads || [])]), aluguel: lista(br.rent), compra: lista(br.buy) },
    jw: br.link || null,
    imdb: d.imdb_id || d.external_ids?.imdb_id || null,
    st: d.status || null,
    temp: tipo === 'tv' ? d.number_of_seasons || null : null,
    eps: tipo === 'tv' ? d.number_of_episodes || null : null,
    pais: (d.origin_country || (d.production_countries || []).map((c) => c.iso_3166_1)).slice(0, 3),
  };
}

export const PARAMS = { language: 'pt-BR', append_to_response: 'credits,videos,watch/providers,external_ids', include_video_language: 'pt,en,null' };

export default async (req) => {
  const u = new URL(req.url);
  const tipo = u.searchParams.get('tipo');
  const id = u.searchParams.get('id') || '';
  if ((tipo !== 'movie' && tipo !== 'tv') || !/^\d{1,9}$/.test(id)) {
    return Response.json({ erro: 'parâmetros inválidos' }, { status: 400 });
  }
  const chave = process.env.TMDB_API_KEY;
  if (!chave) return Response.json({ erro: 'serviço sem chave do TMDB' }, { status: 503 });

  const url = new URL(`https://api.themoviedb.org/3/${tipo}/${id}`);
  for (const [k, v] of Object.entries(PARAMS)) url.searchParams.set(k, v);
  const headers = { accept: 'application/json' };
  if (chave.startsWith('eyJ')) headers.authorization = `Bearer ${chave}`;
  else url.searchParams.set('api_key', chave);

  let res;
  try {
    res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  } catch {
    return Response.json({ erro: 'TMDB indisponível' }, { status: 502 });
  }
  if (res.status === 404) return Response.json({ erro: 'não encontrado' }, { status: 404, headers: { 'cache-control': 'public, max-age=300' } });
  if (!res.ok) return Response.json({ erro: 'TMDB respondeu ' + res.status }, { status: 502 });
  return Response.json(montarDetalhe(tipo, await res.json()), {
    headers: { 'cache-control': 'public, max-age=3600, s-maxage=86400' },
  });
};

export const config = { path: '/api/detalhe' };
