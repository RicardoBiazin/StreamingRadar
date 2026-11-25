# Streaming Radar

Site estático e automático com os lançamentos da semana no Brasil, semana a semana:

- **No cinema**: estreias, com botões para a programação de cada rede (Cinemark, Cinépolis, UCI, Kinoplex, Moviecom, Playarte, Ingresso.com).
- **Filmes no streaming**: lançamentos digitais com a plataforma (Netflix, Prime Video, Disney+, Max, Globoplay...) e link.
- **Séries**: estreias de série e de temporada, com plataforma e canal/rede de origem.
- **Catálogo** (`/catalogo/`): todos os filmes e séries disponíveis por assinatura, grátis ou com anúncios em cada plataforma do Brasil (~59 mil títulos), com busca "onde assistir?", filtro por gênero e ordem por popularidade, nota ou ano. O catálogo não vai para o git (`dados/catalogo/`): `npm run catalogo` coleta (~2,5 min).

Cada cartão traz pôster, nota, sinopse, trailer e links (TMDB, JustWatch, plataforma). A janela é a semana passada e as 26 seguintes (~6 meses de lançamentos futuros); `index.html` mostra a semana atual.

Os dados vêm da API do [TMDB](https://www.themoviedb.org/) (datas de estreia no Brasil, provedores por região do [JustWatch](https://www.justwatch.com/br)). **Limite conhecido:** as redes de cinema não têm API pública, então o site aponta para a página de programação de cada rede e não confirma que a rede exibe o filme.

## Uso

Requer Node 20+. Sem dependências.

```
copy .env.example .env      # preencha TMDB_API_KEY (grátis em themoviedb.org → Configurações → API)
                            # e, opcional, OMDB_API_KEY (grátis em omdbapi.com/apikey.aspx) para as notas de críticos
npm run atualizar           # coletar → normalizar → gerar → testar
npm run preview             # http://127.0.0.1:4207, com a CSP do netlify.toml
npm run exemplo             # dados FICTÍCIOS em .exemplo/, para ver o site sem chave
```

`npm run exemplo` + `SR_EXEMPLO=1 npm run preview` mostra o site com dados de mentira; esse modo nunca grava em `dados/` nem em `public/`, e o `testar` recusa publicar dado que não seja do TMDB.

## Como funciona

| Etapa | Arquivo | Saída |
|---|---|---|
| coletar | `scripts/coletar.mjs`, `scripts/fontes/tmdb.mjs` | `dados/brutos/tmdb.json` |
| normalizar | `scripts/normalizar.mjs` | `dados/lancamentos.json` |
| gerar | `scripts/gerar.mjs`, `src/` | `public/` (uma página por semana) |
| testar | `scripts/testar.mjs` | confere dados, links, versão, créditos, CSP |

Regras: cinema = estreia teatral (tipos 2 e 3 do TMDB) no Brasil; filme no streaming = lançamento digital/físico (tipos 4 e 5) **com plataforma informada**; série = estreia de série ou de temporada com plataforma de assinatura. Séries sem plataforma são descartadas porque não teriam link útil; filmes sem plataforma entram como "Plataforma ainda não informada". A coleta consulta cada plataforma do Brasil separadamente.

**Limite do TMDB:** ele só informa a data de lançamento, não a data em que um título entra no catálogo de uma plataforma. Por isso plataformas de acervo (ex.: Mercado Play) quase não aparecem como novidade.

## Publicação

`.github/workflows/atualizar.yml` roda todo dia às 05:00 (Brasília): coleta, gera, testa, commita `dados/` e publica no Netlify. Secrets do repositório: `TMDB_API_KEY`, `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`. Manual: `npm run publicar`.

## Licença e créditos

MIT. Dados: TMDB e JustWatch; notas do IMDb, Rotten Tomatoes e Metacritic via OMDb API. Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.
