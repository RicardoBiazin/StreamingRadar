// Funções comuns: caminhos, JSON, .env, semanas (segunda a domingo, ISO) e HTML.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Modo exemplo (SR_EXEMPLO=1): lê e grava em .exemplo/, nunca em dados/ e public/.
// Serve para ver o site sem chave do TMDB; o `testar` recusa publicar dado de exemplo.
export const EXEMPLO = process.env.SR_EXEMPLO === '1';

export const caminho = (rel) => {
  if (EXEMPLO && /^(dados|public)(\/|$)/.test(rel)) rel = '.exemplo/' + rel;
  return fileURLToPath(new URL('../' + rel, import.meta.url));
};

export function lerJSON(rel, padrao = null) {
  const arq = caminho(rel);
  return existsSync(arq) ? JSON.parse(readFileSync(arq, 'utf8')) : padrao;
}

export function gravarJSON(rel, dados) {
  gravarTexto(rel, JSON.stringify(dados, null, 1) + '\n');
}

export function gravarTexto(rel, texto) {
  const arq = caminho(rel);
  mkdirSync(dirname(arq), { recursive: true });
  writeFileSync(arq, texto);
}

// Lê o .env local (chave do TMDB). O .env nunca vai para o git.
export function carregarEnv() {
  const arq = fileURLToPath(new URL('../.env', import.meta.url));
  if (!existsSync(arq)) return;
  for (const l of readFileSync(arq, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

export const VERSAO = JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')).version;
export const SITE = 'https://streamingradar.biazin.com.br';

// ---------- datas (sempre como texto AAAA-MM-DD, em UTC, sem fuso) ----------
const DIA = 86400000;
export const paraMs = (s) => Date.parse(s + 'T00:00:00Z');
export const deMs = (ms) => new Date(ms).toISOString().slice(0, 10);
export const somarDias = (s, n) => deMs(paraMs(s) + n * DIA);

// Data de hoje em Brasília.
export function hojeBR() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

export function segunda(s) {
  const dow = (new Date(paraMs(s)).getUTCDay() + 6) % 7;
  return somarDias(s, -dow);
}

// "2026-w48": ano e número da semana ISO da segunda-feira dada.
export function slugSemana(s) {
  const quinta = paraMs(segunda(s)) + 3 * DIA;
  const ano = new Date(quinta).getUTCFullYear();
  const num = 1 + Math.floor((quinta - Date.UTC(ano, 0, 1)) / DIA / 7);
  return `${ano}-w${String(num).padStart(2, '0')}`;
}

const fmt = (opts) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', ...opts });
export const diaLongo = (s) => fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(paraMs(s));
export const diaCurto = (s) => fmt({ day: 'numeric', month: 'short' }).format(paraMs(s)).replace('.', '');

// "24 a 30 de novembro" ou "29 de nov. a 5 de dez."
export function faixa(segundaStr) {
  const a = paraMs(segundaStr), b = paraMs(somarDias(segundaStr, 6));
  const ma = new Date(a).getUTCMonth(), mb = new Date(b).getUTCMonth();
  const dia = (ms) => new Date(ms).getUTCDate();
  const mes = (ms) => fmt({ month: 'long' }).format(ms);
  if (ma === mb) return `${dia(a)} a ${dia(b)} de ${mes(a)}`;
  return `${dia(a)} de ${mes(a)} a ${dia(b)} de ${mes(b)}`;
}

// ---------- texto ----------
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function cortar(s, n) {
  s = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (s.length <= n) return s;
  return s.slice(0, n).replace(/\s+\S*$/, '') + '…';
}
