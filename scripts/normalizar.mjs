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

// Variantes do mesmo serviço (com anúncios, canal da Amazon/Apple, premium) viram ruído:
// ficam só se não sobrar mais nada.
const VARIANTE = /with ads|\bchannel\b|\bpremium\b|\bplus\b.*\bamazon\b/i;

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
  const limpo = saida.filter((x) => !VARIANTE.test(x.nome));
  return limpo.length ? limpo : saida;
}

function base(r, tipo, data) {
  return {
    id: `${tipo}-${r.id}`, tmdb: r.id, imdb: r.imdb || null, tipo, titulo: r.titulo, original: r.original && r.original !== r.titulo ? r.original : null,
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
  const datas = (r.datas || []).filter((x) => [1, 4, 5, 6].includes(x.tipo) && dentro(x.data)).map((x) => x.data);
  if (!datas.length) continue;
  itens.push({ ...base(r, 'filme', menor(datas)), duracao: r.duracao, classificacao: r.classificacao });
}
// Filme com data digital mas sem plataforma informada ainda (comum nas semanas futuras):
// entra como "plataforma a confirmar", no máximo 10 por semana, os mais populares.
const semPlat = new Map();
for (const i of itens.filter((x) => x.tipo === 'filme' && !x.plataformas.length).sort((a, b) => b.popularidade - a.popularidade)) {
  const n = (semPlat.get(i.semana) || 0) + 1;
  semPlat.set(i.semana, n);
  if (n > 10) i.descartar = true;
}
for (let k = itens.length - 1; k >= 0; k--) if (itens[k].descartar) itens.splice(k, 1);

// Quando o TMDB ainda não tem provedor para a série, a rede de origem diz a plataforma
// (só redes que SÃO streaming; canal de TV não entra). Marcado como "inferido".
const REDES_STREAMING = [
  [/^prime video$|^amazon$/i, 'Amazon Prime Video'], [/^netflix$/i, 'Netflix'], [/^disney\+$|^disney plus$/i, 'Disney Plus'],
  [/^apple tv\+?$/i, 'Apple TV'], [/^(hbo )?max$|^hbo max$/i, 'HBO Max'], [/^paramount\+$|^paramount plus$/i, 'Paramount Plus'],
  [/^crunchyroll$/i, 'Crunchyroll'], [/^globoplay$/i, 'Globoplay'], [/^mercado play$/i, 'Mercado Play'],
];
const deduzir = (canais) => (canais || []).flatMap((c) => REDES_STREAMING.filter(([re]) => re.test(c)).map(([, nome]) => ({ id: null, nome, logo: null, tipo: 'assinatura', inferido: true })));

for (const r of bruto.series) {
  let pl = plataformas(r.provedores);
  if (!pl.length) pl = deduzir(r.canais);
  // Estreia de temporada: data da temporada, ou episódio 1 (último/próximo) dentro da janela.
  const temps = (r.temporadas || []).filter((t) => t.n > 0 && dentro(t.data));
  for (const e of [r.ultimoEp, r.proximoEp]) if (e && e.episodio === 1 && e.temporada > 0 && dentro(e.data)) temps.push({ n: e.temporada, data: e.data });
  if (!pl.length || !temps.length) continue;
  const t = temps.sort((a, b) => a.data.localeCompare(b.data))[0];
  itens.push({ ...base(r, 'serie', t.data), plataformas: pl, temporada: t.n, canais: r.canais || [] });
}

itens.sort((a, b) => a.data.localeCompare(b.data) || b.popularidade - a.popularidade);

const cont = (t) => itens.filter((i) => i.tipo === t).length;
gravarJSON('dados/lancamentos.json', { fonte: bruto.fonte, coletadoEm: bruto.coletadoEm, de, ate, itens });
console.log(`${itens.length} itens: cinema ${cont('cinema')} · filmes ${cont('filme')} · séries ${cont('serie')}`);
