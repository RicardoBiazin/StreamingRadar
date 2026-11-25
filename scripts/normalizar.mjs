// Transforma o bruto do TMDB em dados/lancamentos.json: uma lista de itens com
// tipo (cinema | filme | serie), data de estreia no Brasil e semana (segunda a domingo).

import { lerJSON, gravarJSON, slugSemana, segunda } from './util.mjs';

const bruto = lerJSON('dados/brutos/tmdb.json');
if (!bruto) {
  console.error('Sem dados/brutos/tmdb.json: rode `npm run coletar` primeiro.');
  process.exit(1);
}
const { de, ate } = bruto;
const dentro = (d) => d >= de && d <= ate;
const menor = (a) => a.sort()[0];

function plataformas(p) {
  if (!p) return [];
  const vistos = new Set();
  const saida = [];
  for (const [tipo, lista] of [['assinatura', p.flatrate], ['aluguel', p.rent], ['compra', p.buy]]) {
    for (const x of lista || []) {
      if (vistos.has(x.id)) continue; // a assinatura vale mais que aluguel/compra
      vistos.add(x.id);
      saida.push({ id: x.id, nome: x.nome, logo: x.logo, tipo });
    }
  }
  return saida;
}

function base(r, tipo, data) {
  return {
    id: `${tipo}-${r.id}`, tmdb: r.id, tipo, titulo: r.titulo, original: r.original && r.original !== r.titulo ? r.original : null,
    data, semana: slugSemana(data), segunda: segunda(data),
    generos: r.generos || [], nota: r.votos > 0 ? Math.round(r.nota * 10) / 10 : null, votos: r.votos || 0,
    sinopse: (r.sinopse || '').trim(), poster: r.poster || null, trailer: r.trailer || null,
    popularidade: r.popularidade || 0, plataformas: plataformas(r.provedores), justwatch: r.provedores?.link || null,
  };
}

const itens = [];

for (const r of bruto.cinema) {
  const datas = (r.datas || []).filter((x) => (x.tipo === 2 || x.tipo === 3) && dentro(x.data)).map((x) => x.data);
  if (!datas.length) continue;
  itens.push({ ...base(r, 'cinema', menor(datas)), duracao: r.duracao, classificacao: r.classificacao, plataformas: [], justwatch: null });
}

for (const r of bruto.filmes) {
  const datas = (r.datas || []).filter((x) => (x.tipo === 4 || x.tipo === 5) && dentro(x.data)).map((x) => x.data);
  const pl = plataformas(r.provedores);
  if (!datas.length || !pl.length) continue; // sem plataforma informada não dá link útil
  itens.push({ ...base(r, 'filme', menor(datas)), duracao: r.duracao, classificacao: r.classificacao });
}

for (const r of bruto.series) {
  const pl = plataformas(r.provedores);
  const temps = (r.temporadas || []).filter((t) => t.n > 0 && dentro(t.data));
  if (!pl.length || !temps.length) continue;
  const t = temps.sort((a, b) => a.data.localeCompare(b.data))[0];
  itens.push({ ...base(r, 'serie', t.data), temporada: t.n, canais: r.canais || [] });
}

itens.sort((a, b) => a.data.localeCompare(b.data) || b.popularidade - a.popularidade);

const cont = (t) => itens.filter((i) => i.tipo === t).length;
gravarJSON('dados/lancamentos.json', { fonte: bruto.fonte, coletadoEm: bruto.coletadoEm, de, ate, itens });
console.log(`${itens.length} itens: cinema ${cont('cinema')} · filmes ${cont('filme')} · séries ${cont('serie')}`);
