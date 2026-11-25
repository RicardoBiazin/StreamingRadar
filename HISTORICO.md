# Histórico

## 0.1.2 — 24/11/2026

- Modo de exibição: "Todos juntos" (padrão) lista os cartões numa grade alinhada, com a data em cada cartão; "Por dia" mantém as colunas por dia. A escolha fica salva no navegador.
- O `testar` confere que toda data de cartão está preenchida.

## 0.1.1 — 24/11/2026

Primeira coleta com a chave real do TMDB (219 itens em 9 semanas) e ajustes a partir dela.

- Séries: estreia de temporada também por episódio 1 (último/próximo episódio) e descoberta de séries novas por `first_air_date`; antes só 20 de 120 séries passavam.
- Plataformas: variantes do mesmo serviço (com anúncios, canais da Amazon/Apple, Premium) saem da lista.
- Filmes com data digital, mas sem plataforma informada (comum nas semanas futuras), aparecem como "Plataforma ainda não informada" (máx. 10 por semana, os mais populares).
- Dados coletados passam a ser versionados em `dados/`.

Limite do TMDB: as semanas futuras têm poucos filmes/séries de streaming com data e plataforma; o cinema é bem coberto.

## 0.1.0 — 24/11/2026

Primeira versão.

- Pipeline coletar → normalizar → gerar → testar (Node puro, sem dependências), no padrão do RankingIA.
- Coleta no TMDB (chave v3 ou token v4): estreias de cinema no Brasil, filmes com lançamento digital/físico e séries/temporadas, todos com provedores do JustWatch para o Brasil.
- Site estático em pt-BR: uma página por semana (`/semana/AAAA-wNN.html`), `index.html` na semana atual, navegação entre semanas, seções Cinema / Filmes / Séries agrupadas por dia, filtro por plataforma, botões das redes de cinema.
- `npm run exemplo`: dados fictícios em `.exemplo/` para ver o site sem chave; `testar` recusa dado que não seja do TMDB.
- GitHub Actions diário e `netlify.toml` com CSP.

Pendências:
- Conferir estreias reais (datas e plataformas) contra Adorocinema/Ingresso.com.
- Criar o site no Netlify, gravar os secrets e apontar `streamingradar.biazin.com.br` (CNAME na Cloudflare).
- Logo do TMDB no rodapé (hoje só o texto de crédito).
- Confirmar os links das redes (Cinépolis bloqueia robôs; só testado no navegador).
