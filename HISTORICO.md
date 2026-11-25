# Histórico

## 0.1.0 — 24/11/2026

Primeira versão.

- Pipeline coletar → normalizar → gerar → testar (Node puro, sem dependências), no padrão do RankingIA.
- Coleta no TMDB (chave v3 ou token v4): estreias de cinema no Brasil, filmes com lançamento digital/físico e séries/temporadas, todos com provedores do JustWatch para o Brasil.
- Site estático em pt-BR: uma página por semana (`/semana/AAAA-wNN.html`), `index.html` na semana atual, navegação entre semanas, seções Cinema / Filmes / Séries agrupadas por dia, filtro por plataforma, botões das redes de cinema.
- `npm run exemplo`: dados fictícios em `.exemplo/` para ver o site sem chave; `testar` recusa dado que não seja do TMDB.
- GitHub Actions diário e `netlify.toml` com CSP.

Pendências:
- Rodar com a chave real do TMDB e conferir estreias reais (datas e plataformas) contra Adorocinema/Ingresso.com.
- Criar o site no Netlify, gravar os secrets e apontar `streamingradar.biazin.com.br` (CNAME na Cloudflare).
- Logo do TMDB no rodapé (hoje só o texto de crédito).
- Confirmar os links das redes (Cinépolis bloqueia robôs; só testado no navegador).
