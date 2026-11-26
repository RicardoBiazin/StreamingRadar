// Gera os modelos de layout em dist-modelos/ (galeria + uma página por modelo), com os dados reais.
// Uso: node scripts/modelos.mjs [id ...]      (sem id: todos)
//      node scripts/modelos.mjs --testar      (confere os modelos já gerados)
// Os modelos NÃO tocam em public/ nem no site oficial.

import { readdirSync, existsSync, mkdirSync, rmSync, cpSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { carregar, esc } from '../modelos/_base.mjs';

const raiz = fileURLToPath(new URL('../', import.meta.url));
const pastaModelos = join(raiz, 'modelos');
const saida = join(raiz, 'dist-modelos');

const args = process.argv.slice(2);
const testar = args.includes('--testar');
const servir = args.indexOf('--servir');

// Servidor local de dist-modelos/ com a CSP do netlify.toml: node scripts/modelos.mjs --servir [porta]
if (servir !== -1) {
  const http = await import('node:http');
  const { extname, normalize } = await import('node:path');
  const csp = readFileSync(join(raiz, 'netlify.toml'), 'utf8').match(/Content-Security-Policy = "([^"]+)"/)?.[1];
  const porta = Number(args[servir + 1] || 4300);
  const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };
  http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const arq = normalize(join(saida, rel));
    const ok = arq.startsWith(saida) && existsSync(arq) && statSync(arq).isFile();
    res.writeHead(ok ? 200 : 404, { 'content-type': TIPOS[extname(arq)] || 'application/octet-stream', 'content-security-policy': csp });
    res.end(ok ? readFileSync(arq) : 'não encontrado');
  }).listen(porta, '127.0.0.1', () => console.log(`http://127.0.0.1:${porta}  (${saida})`));
  await new Promise(() => {});
}

const pedidos = args.filter((a) => !a.startsWith('--') && !/^\d+$/.test(a));

const ids = readdirSync(pastaModelos)
  .filter((n) => statSync(join(pastaModelos, n)).isDirectory() && existsSync(join(pastaModelos, n, 'modelo.mjs')))
  .sort();

function problemas(id, html, d) {
  const p = [];
  const ok = (c, m) => { if (!c) p.push(m); };
  ok(/^<!doctype html>/i.test(html.trim()), 'não começa com <!doctype html>');
  ok(/<meta name="robots" content="noindex/.test(html), 'sem noindex');
  ok(html.includes(`/${id}/estilo.css`), `sem link para /${id}/estilo.css`);
  ok(!/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)/.test(html), 'script inline (a CSP do site só aceita arquivo)');
  ok(!/<style[\s>]/.test(html) && !/\sstyle="/.test(html), 'estilo inline (a CSP do site só aceita arquivo)');
  ok(!/\bundefined\b|\bNaN\b|\[object Object\]/.test(html), 'texto quebrado (undefined/NaN/[object Object])');
  // todos os itens da semana precisam aparecer, com link para o TMDB
  const faltam = d.semana.itens.filter((i) => !html.includes(`/${i.tipo === 'serie' ? 'tv' : 'movie'}/${i.tmdb}`));
  ok(!faltam.length, `${faltam.length} item(ns) da semana sem link para o TMDB (ex.: ${faltam[0]?.titulo})`);
  ok(html.includes('themoviedb.org') && html.includes('justwatch.com'), 'faltam créditos TMDB/JustWatch');
  ok(html.includes('licença MIT') || html.includes('MIT'), 'falta a licença MIT no rodapé');
  ok(html.includes(`v${d.versao}`), 'falta a versão no rodapé');
  for (const r of d.redes) ok(html.includes(r.href), `sem o link da rede ${r.nome}`);
  ok(d.semana.itens.length > 0, 'semana sem itens');
  return p;
}

const d = carregar();

if (testar) {
  let falhas = 0;
  for (const id of ids) {
    const arq = join(saida, id, 'index.html');
    if (!existsSync(arq)) { console.log(`✗ ${id}: não gerado`); falhas++; continue; }
    const p = problemas(id, readFileSync(arq, 'utf8'), d);
    const css = existsSync(join(saida, id, 'estilo.css'));
    if (!css) p.push('sem estilo.css');
    console.log(p.length ? `✗ ${id}: ${p.join('; ')}` : `✓ ${id}`);
    if (p.length) falhas++;
  }
  process.exit(falhas ? 1 : 0);
}

const alvo = pedidos.length ? pedidos : ids;
const metas = [];
let falhas = 0;
for (const id of ids) {
  const dir = join(saida, id);
  if (pedidos.length && !pedidos.includes(id)) {
    // mantém o que já existe para o índice
    try { metas.push({ id, ...(await import(pathToFileURL(join(pastaModelos, id, 'modelo.mjs')).href)).meta }); } catch { /* ignora */ }
    continue;
  }
  const mod = await import(pathToFileURL(join(pastaModelos, id, 'modelo.mjs')).href + `?t=${Date.now()}`);
  if (!mod.meta || typeof mod.render !== 'function') { console.error(`✗ ${id}: modelo.mjs precisa exportar meta e render(d)`); falhas++; continue; }
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  // tudo que não é modelo.mjs é servido (css, js, fontes, svg)
  for (const n of readdirSync(join(pastaModelos, id))) {
    if (n !== 'modelo.mjs') cpSync(join(pastaModelos, id, n), join(dir, n), { recursive: true });
  }
  const html = mod.render(d);
  writeFileSync(join(dir, 'index.html'), html);
  const p = problemas(id, html, d);
  console.log(p.length ? `✗ ${id}: ${p.join('; ')}` : `✓ ${id} (${mod.meta.nome})`);
  if (p.length) falhas++;
  metas.push({ id, ...mod.meta });
}

// galeria
metas.sort((a, b) => a.id.localeCompare(b.id));
mkdirSync(saida, { recursive: true });
writeFileSync(join(saida, 'index.html'), `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Modelos de layout · Streaming Radar</title>
<link rel="stylesheet" href="/galeria.css"></head><body>
<main><h1>Modelos de layout do Streaming Radar</h1>
<p>Sete visuais para a mesma página (a semana atual, com os dados reais). Não são o site oficial.</p>
<ul class="grade">
${metas.map((m) => `<li><a href="/${esc(m.id)}/"><strong>${esc(m.nome)}</strong><span>Inspirado em ${esc(m.inspiracao)}</span><em>${esc(m.descricao)}</em></a></li>`).join('\n')}
</ul>
<p class="rodape">Versão ${esc(d.versao)} · <a href="${esc(d.site)}">site oficial</a></p></main></body></html>
`);
writeFileSync(join(saida, 'galeria.css'), `:root{color-scheme:light dark}body{margin:0;font:16px/1.5 system-ui,sans-serif;background:#f4f4f2;color:#1b1b1b}
@media (prefers-color-scheme:dark){body{background:#121212;color:#eee}}
main{max-width:980px;margin:0 auto;padding:32px 16px}h1{margin:0 0 4px}
.grade{list-style:none;padding:0;margin:24px 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
.grade a{display:flex;flex-direction:column;gap:4px;padding:16px;border:1px solid #8884;border-radius:12px;text-decoration:none;color:inherit;height:100%;box-sizing:border-box}
.grade a:hover{border-color:#0a7d6e}.grade span{color:#0a7d6e;font-size:.85rem;font-weight:600}.grade em{font-style:normal;opacity:.75;font-size:.9rem}
.rodape{opacity:.7;font-size:.85rem}
`);
console.log(falhas ? `${falhas} modelo(s) com problema` : `modelos ok → dist-modelos/ (${alvo.length} gerado(s))`);
process.exit(falhas ? 1 : 0);
