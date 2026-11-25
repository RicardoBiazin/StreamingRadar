// Busca as notas (IMDb, Rotten Tomatoes, Metacritic) dos itens de lancamentos.json na OMDb.
// Cache em dados/notas.json (chave = id do IMDb), para respeitar o limite de 1.000/dia.
// Sem OMDB_API_KEY o passo é pulado e o site mostra só a nota do TMDB.

import { carregarEnv, lerJSON, gravarJSON, hojeBR, paraMs } from './util.mjs';
import { buscarNotas } from './fontes/omdb.mjs';
import { emLote } from './fontes/tmdb.mjs';

carregarEnv();
const chave = process.env.OMDB_API_KEY;
if (!chave) {
  console.log('Sem OMDB_API_KEY: notas do IMDb/Rotten Tomatoes/Metacritic puladas (grátis em omdbapi.com/apikey.aspx).');
  process.exit(0);
}

const dados = lerJSON('dados/lancamentos.json');
if (!dados) { console.error('Rode `npm run normalizar` antes.'); process.exit(1); }
const cache = lerJSON('dados/notas.json', {});
const hoje = hojeBR();
const dias = (a) => Math.floor((paraMs(hoje) - paraMs(a)) / 86400000);

// Quem precisa (re)consultar: nunca consultado; consultado há mais de 14 dias; ou sem nenhuma
// nota (estreia recente) e consultado há mais de 3 dias.
const vazio = (n) => n.imdb == null && n.rt == null && n.mc == null;
const precisa = (id) => {
  const n = cache[id];
  return !n || dias(n.em) > 14 || (vazio(n) && dias(n.em) > 3);
};

const LIMITE = 900; // margem sob as 1.000 consultas diárias
const ids = [];
for (const i of [...dados.itens].sort((a, b) => b.popularidade - a.popularidade)) {
  if (i.imdb && !ids.includes(i.imdb) && precisa(i.imdb)) ids.push(i.imdb);
}
const lote = ids.slice(0, LIMITE);
console.log(`${ids.length} itens para consultar na OMDb (consultando ${lote.length})`);

let ok = 0;
try {
  await emLote(lote, 5, async (id) => {
    const n = await buscarNotas(chave, id);
    if (n) { cache[id] = { ...n, em: hoje }; ok++; }
  });
} catch (e) {
  console.error('OMDb:', e.message, '— mantendo o que já foi coletado.');
}
gravarJSON('dados/notas.json', cache);
console.log(`${ok} notas atualizadas; ${Object.keys(cache).length} no cache`);
