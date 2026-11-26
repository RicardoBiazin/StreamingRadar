// Modo exemplo: gera um bruto FICTÍCIO em .exemplo/ e roda normalizar + gerar, para ver o
// site sem chave do TMDB. Nunca toca dados/ nem public/. O `testar` recusa dado de exemplo.

process.env.SR_EXEMPLO = '1';
const { gravarJSON, hojeBR, segunda, somarDias } = await import('./util.mjs');

const hoje = hojeBR();
const seg = segunda(hoje);
const de = somarDias(seg, -7);
const ate = somarDias(seg, 7 * 7 + 6);
const d = (n) => somarDias(seg, n);

const generos = [['Ação', 'Aventura'], ['Drama'], ['Comédia', 'Romance'], ['Terror', 'Suspense'], ['Animação', 'Família']];
const lorem = 'Texto de exemplo, fictício, só para testar o layout do site. Nenhum desses filmes ou séries existe de verdade.';
const NETFLIX = { id: 8, nome: 'Netflix', logo: null };
const PRIME = { id: 119, nome: 'Amazon Prime Video', logo: null };
const DISNEY = { id: 337, nome: 'Disney Plus', logo: null };
const MAX = { id: 1899, nome: 'Max', logo: null };
const GLOBO = { id: 307, nome: 'Globoplay', logo: null };
const PLATS = [NETFLIX, PRIME, DISNEY, MAX, GLOBO];

let n = 1000;
const filme = (i, extra) => ({
  id: ++n, imdb: `tt9${n}`, titulo: `Filme Fictício ${i}`, original: i % 3 ? `Fictional Movie ${i}` : `Filme Fictício ${i}`, lingua: 'en',
  sinopse: lorem, poster: null, generos: generos[i % generos.length], nota: 5 + (i % 5), votos: i % 4 ? 120 : 0,
  popularidade: 100 - i, duracao: 90 + i * 3, datas: [], classificacao: ['L', '10', '12', '14', '16'][i % 5], trailer: null,
  provedores: null, ...extra,
});

const cinema = [], filmes = [], series = [];
for (let i = 0; i < 26; i++) {
  cinema.push(filme(i, { datas: [{ tipo: 3, data: d(-7 + (i % 5) * 1 + Math.floor(i / 5) * 7 + (i % 3 === 0 ? 3 : 0)) }] }));
}
for (let i = 0; i < 24; i++) {
  const p = PLATS[i % PLATS.length];
  filmes.push(filme(100 + i, {
    datas: [{ tipo: 4, data: d(-7 + (i % 6) + Math.floor(i / 6) * 7) }], trailer: i % 2 ? 'dQw4w9WgXcQ' : null,
    provedores: { link: 'https://www.justwatch.com/br/filme/exemplo', flatrate: i % 5 === 4 ? [] : [p], rent: i % 5 === 4 ? [{ id: 3, nome: 'Google Play Filmes', logo: null }] : [], buy: [] },
  }));
}
for (let i = 0; i < 20; i++) {
  const p = PLATS[(i + 1) % PLATS.length];
  const dia = d(-7 + (i % 7) + Math.floor(i / 7) * 7);
  series.push({
    id: ++n, imdb: `tt9${n}`, titulo: `Série Fictícia ${i}`, original: `Fictional Series ${i}`, lingua: 'en', sinopse: lorem, poster: null,
    generos: generos[i % generos.length], nota: 7, votos: 300, popularidade: 80 - i, primeira: dia,
    temporadas: [{ n: i % 3 === 0 ? 1 : 2, data: dia }], canais: i % 2 ? [p.nome] : ['Canal Fictício'], trailer: null,
    provedores: { link: 'https://www.justwatch.com/br/serie/exemplo', flatrate: [p], rent: [], buy: [] },
  });
}

gravarJSON('dados/brutos/tmdb.json', { fonte: 'exemplo', coletadoEm: new Date().toISOString(), hoje, de, ate, cinema, filmes, series });
// Notas fictícias (variando para exercitar as cores dos selos).
const notas = {};
[...cinema, ...filmes, ...series].forEach((r, k) => {
  notas[r.imdb] = k % 7 === 6 ? { imdb: null, votos: null, rt: null, mc: null, em: hoje }
    : { imdb: 4 + (k % 6) + 0.3, votos: 1000 * (k + 1), rt: (k * 13) % 100, mc: k % 5 === 0 ? null : (k * 17) % 100, em: hoje };
});
gravarJSON('dados/notas.json', notas);
// Detalhes fictícios para o modal (elenco inventado).
const detalhes = {};
for (const [lista, tipo] of [[cinema, 'movie'], [filmes, 'movie'], [series, 'tv']]) {
  for (const r of lista) {
    detalhes[`${tipo}-${r.id}`] = {
      tipo, id: r.id, t: r.titulo, o: r.original, l: 'Slogan fictício de exemplo', s: lorem + ' ' + lorem, d: (r.datas?.[0]?.data || r.primeira), r: r.duracao || 45,
      g: r.generos, n: r.nota, v: r.votos, dir: ['Diretor Fictício'], tr: null,
      el: Array.from({ length: 12 }, (_, k) => ({ n: `Ator Fictício ${k + 1}`, p: `Personagem ${k + 1}`, f: null })),
      pl: { assinatura: (r.provedores?.flatrate || []).map((p) => ({ n: p.nome, l: null })), aluguel: [], compra: [] },
      jw: null, imdb: r.imdb, st: tipo === 'tv' ? 'Em exibição' : 'Released', temp: tipo === 'tv' ? 2 : null, eps: tipo === 'tv' ? 16 : null, pais: ['BR'],
    };
  }
}
gravarJSON('dados/detalhes.json', detalhes, true);
await import('./normalizar.mjs');
await import('./gerar.mjs');
console.log('Exemplo pronto em .exemplo/public (rode `npm run preview` com SR_EXEMPLO=1 para abrir).');
