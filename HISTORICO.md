# Histórico

## 0.1.4 — 24/11/2026

- Lançamentos futuros: a janela passa de 7 para 26 semanas à frente (~6 meses), 28 páginas de semana. O cinema é bem coberto; streaming futuro depende do que o TMDB já sabe.
- Notas de críticos: selos IMDb, Rotten Tomatoes e Metacritic nos cartões, via OMDb API (`OMDB_API_KEY`, grátis, 1.000 consultas/dia; cache em `dados/notas.json`, no máximo 900 consultas por dia). Sem a chave o passo é pulado e fica só a nota do TMDB. O id do IMDb vem do TMDB.
- `testar` confere o parser da OMDb e os limites das notas.

## 0.1.3 — 24/11/2026

- Coleta por plataforma: cada provedor do Brasil (até 80, sem variantes de canal/anúncios) é consultado sozinho no TMDB. Antes só entrava o topo por popularidade e faltavam Prime Video, Disney+, Mercado Play e outras. Séries de 30 para 73 na janela.
- Filmes no streaming passam a aceitar também estreia (tipo 1) e TV (tipo 6), além de digital e físico.
- Links de ~30 plataformas (Mercado Play, Pluto TV, Looke, Claro tv+, TV Brasil Play, Curiosity Stream, Oldflix, Belas Artes à La Carte, etc.); as demais caem no JustWatch.
- Limite do TMDB: ele só sabe a data de lançamento, não a data em que o título entra no catálogo. Plataformas de acervo (Mercado Play: 1.197 filmes, nenhum com data na janela) quase não aparecem como "novidade".

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
