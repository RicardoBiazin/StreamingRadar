// Servidor local de public/ (ou .exemplo/public com SR_EXEMPLO=1) aplicando os cabeçalhos
// do netlify.toml, em especial a CSP: o `serve` comum não aplica, e a CSP já quebrou site.
// Uso: node scripts/servir.mjs [porta]

import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { caminho, carregarEnv } from './util.mjs';

const raiz = caminho('public');
const csp = readFileSync(caminho('netlify.toml'), 'utf8').match(/Content-Security-Policy = "([^"]+)"/)?.[1];
const porta = Number(process.argv[2] || 4207);
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' };

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  // Imita a Netlify Function do modal de detalhe (usa TMDB_API_KEY do .env).
  if (u.pathname === '/api/detalhe') {
    carregarEnv();
    const { default: fn } = await import('../netlify/functions/detalhe.mjs');
    const r = await fn(new Request(u));
    res.writeHead(r.status, { 'content-type': 'application/json', 'content-security-policy': csp });
    return res.end(Buffer.from(await r.arrayBuffer()));
  }
  let rel = decodeURIComponent(u.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  let arq = normalize(join(raiz, rel));
  const ok = arq.startsWith(raiz) && existsSync(arq) && statSync(arq).isFile();
  if (!ok) arq = join(raiz, '404.html');
  res.writeHead(ok ? 200 : 404, { 'content-type': TIPOS[extname(arq)] || 'application/octet-stream', 'content-security-policy': csp, 'x-content-type-options': 'nosniff' });
  res.end(readFileSync(arq));
}).listen(porta, '127.0.0.1', () => console.log(`http://127.0.0.1:${porta}  (${raiz})`));
