// Coleta no TMDB e grava dados/brutos/tmdb.json.
// Janela: a semana passada e as 26 seguintes (segunda a domingo).

import { carregarEnv, gravarJSON, lerJSON, hojeBR, segunda, somarDias } from './util.mjs';
import { coletarTudo } from './fontes/tmdb.mjs';

carregarEnv();
const chave = process.env.TMDB_API_KEY;
if (!chave) {
  console.error('Falta TMDB_API_KEY (no .env ou no ambiente). Crie a chave grátis em themoviedb.org → Configurações → API.');
  process.exit(1);
}

const hoje = hojeBR();
const de = somarDias(segunda(hoje), -7);
const SEMANAS_FUTURAS = 26; // ~6 meses à frente
const ate = somarDias(segunda(hoje), 7 * SEMANAS_FUTURAS + 6);
console.log(`Coletando ${de} → ${ate}`);

try {
  const bruto = await coletarTudo(chave, { de, ate });
  const total = bruto.cinema.length + bruto.filmes.length + bruto.series.length;
  if (total === 0) throw new Error('TMDB devolveu zero itens; mantendo o bruto anterior.');
  gravarJSON('dados/brutos/tmdb.json', { fonte: 'tmdb', coletadoEm: new Date().toISOString(), hoje, de, ate, ...bruto });
  console.log(`cinema ${bruto.cinema.length} · filmes ${bruto.filmes.length} · séries ${bruto.series.length}`);
} catch (e) {
  // Se já existe um bruto, o site continua no ar com ele; só a coleta do dia falha.
  console.error('Coleta falhou:', e.message);
  if (lerJSON('dados/brutos/tmdb.json')) {
    console.error('Usando o bruto anterior.');
    process.exit(process.env.GITHUB_ACTIONS ? 1 : 0);
  }
  process.exit(1);
}
