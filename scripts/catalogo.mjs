// Coleta o catálogo completo por plataforma (assinatura, grátis ou com anúncios) no TMDB.
// Grava dados/catalogo/bruto.json (fora do git: muda todo dia e pesa ~10 MB).

import { carregarEnv, gravarJSON, lerJSON } from './util.mjs';
import { provedoresBR, coletarCatalogo } from './fontes/tmdb.mjs';

carregarEnv();
const chave = process.env.TMDB_API_KEY;
if (!chave) {
  console.error('Falta TMDB_API_KEY.');
  process.exit(1);
}

try {
  const provs = await provedoresBR(chave);
  console.log(`Catálogo: ${provs.length} plataformas`);
  const cat = await coletarCatalogo(chave, provs, (m) => console.log(m));
  const total = cat.plataformas.reduce((s, p) => s + p.itens.length, 0);
  if (!total) throw new Error('catálogo vazio');
  gravarJSON('dados/catalogo/bruto.json', { fonte: 'tmdb', coletadoEm: new Date().toISOString(), ...cat }, true);
  console.log(`${cat.plataformas.length} plataformas, ${total} títulos (somando plataformas)`);
} catch (e) {
  console.error('Coleta do catálogo falhou:', e.message);
  if (lerJSON('dados/catalogo/bruto.json')) {
    console.error('Usando o catálogo anterior.');
    process.exit(process.env.GITHUB_ACTIONS ? 1 : 0);
  }
  process.exit(1);
}
