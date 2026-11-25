// Notas de IMDb, Rotten Tomatoes e Metacritic pela OMDb API (omdbapi.com, chave grátis,
// 1.000 consultas por dia). Rotten Tomatoes e Metacritic não têm API pública própria.

// Converte a resposta da OMDb em { imdb, votos, rt, mc } (null quando "N/A").
export function lerOmdb(j) {
  if (!j || j.Response === 'False') return null;
  const num = (v) => {
    const n = parseFloat(String(v ?? '').replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  };
  const fonte = (nome) => (j.Ratings || []).find((r) => r.Source === nome)?.Value;
  const rt = num(fonte('Rotten Tomatoes'));            // "87%"
  const mc = num(j.Metascore) ?? num(String(fonte('Metacritic') ?? '').split('/')[0]); // "76/100"
  return { imdb: num(j.imdbRating), votos: num(j.imdbVotes), rt, mc };
}

export async function buscarNotas(chave, imdbId) {
  const url = `https://www.omdbapi.com/?apikey=${encodeURIComponent(chave)}&i=${encodeURIComponent(imdbId)}`;
  for (let t = 1; t <= 3; t++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (res.status === 401) throw Object.assign(new Error('OMDb recusou a chave (401): limite diário ou chave inválida.'), { fatal: true });
      if (res.ok) return lerOmdb(await res.json());
    } catch (e) {
      if (e.fatal || t === 3) throw e;
    }
    await new Promise((r) => setTimeout(r, 1000 * t));
  }
  return null;
}
