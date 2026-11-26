# Histórico

## 0.3.2 — 26/11/2026

- Índice do catálogo (`/catalogo/`) com filtros: faixas de tipo (filmes/séries) e de gêneros com contagem, seletor de plataforma, ordem (populares, nota, recentes, A a Z) e busca, sobre os ~59 mil títulos de todas as plataformas, com as plataformas de cada título no cartão. Os 48 mais populares já vêm no HTML; o `busca.json` (títulos com gêneros e plataformas) só é baixado na primeira interação. A página de cada plataforma e o índice usam o mesmo motor em `catalogo.js`.
- As faixas de gênero e de tipo quebram em várias linhas, sem barra de rolagem.
- Rodapé com a licença MIT (link para o arquivo LICENSE).
- O Actions passou a publicar no Netlify (secret `NETLIFY_AUTH_TOKEN` corrigido): coleta, commit dos dados e deploy em 1 min 47 s.

## 0.3.1 — 26/11/2026

- Corrigido: "quando clica nada acontece" e faixas de gênero sem estilo. O navegador guardava por 1 hora o CSS e o JS antigos (`Cache-Control: max-age=3600` em `/assets/*`) junto com o HTML novo. Agora os arquivos saem com `?v=<versão>` (muda a cada versão) e `/assets/*` passou a `max-age=0, must-revalidate`. O `testar` confere o `?v=` nos CSS/JS.
- Rodapé com as fontes: TMDB (títulos, datas, elenco, pôsteres), JustWatch (onde assistir), OMDb API (notas de IMDb, Rotten Tomatoes e Metacritic), AdoroCinema (mais críticas em português), links das redes de cinema e das principais plataformas, aviso do TMDB e de marcas.
- Pendente: logo do TMDB no rodapé (hoje só o texto de crédito).

## 0.3.0 — 26/11/2026

- Modal de detalhe: clicar no título ou no pôster de um filme/série (semana e catálogo) abre elenco (12 nomes com foto e personagem), direção/criação, sinopse completa, gêneros, duração, temporadas, nota do TMDB, onde assistir no Brasil (assinatura/grátis, aluguel, compra) e links (TMDB, IMDb, trailer, JustWatch). Cartões de lançamento carregam um arquivo estático (`public/detalhe/<tipo>-<id>.json`, gerado na coleta); o catálogo usa a Netlify Function `/api/detalhe` (`netlify/functions/detalhe.mjs`), que consulta o TMDB com a chave guardada na variável `TMDB_API_KEY` do Netlify (nunca no navegador) e fica em cache de 1 dia no CDN. Sem JS, o clique segue o link do TMDB.
- Filtros por categoria, como nos serviços de streaming: faixa de gêneros com contagem na semana (filtra os cartões e as contagens das seções, junto com o filtro de plataforma; fica no endereço, `#gen=drama`) e, no catálogo de cada plataforma, faixas de tipo (filmes/séries) e de gêneros, além de busca e ordem.
- `testar` confere `montarDetalhe`, a recusa de parâmetros inválidos na função, os arquivos de detalhe dos cartões e as faixas de gênero.
- O Actions de 26/11 coletou, commitou os dados e falhou só no deploy: "Unauthorized: could not retrieve project" (NETLIFY_AUTH_TOKEN ou NETLIFY_SITE_ID gravado errado; regravar com `--body`).

## 0.2.2 — 26/11/2026

- Causa de "Plataforma ainda não informada" em O Pequeno Guerreiro (Way of the Warrior Kid): dado velho. O TMDB só ligou o filme à Apple TV depois da última coleta, e o site não se atualiza sozinho enquanto os secrets do GitHub (`TMDB_API_KEY`, `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`) não existirem: o workflow diário roda em 8 s e não faz nada.
- Filmes originais de streaming sem provedor no TMDB agora têm a plataforma deduzida do estúdio de produção (Apple Studios/Original Films, Netflix, Amazon MGM Studios, Disney+/Hulu Originals, Max Originals, Paramount+ Originals), como já era com a rede de origem nas séries.
- Limite: o Google também mostra Prime Video (assinatura do canal Apple TV dentro do Prime); o site ignora variantes de canal de propósito.

## 0.2.1 — 25/11/2026

- Séries originais sem dado de provedor no TMDB agora aparecem. Caso que mostrou o furo: Blade Runner 2099 (Prime Video) não tinha provedor nenhum para o Brasil no dia da estreia e era descartado. A coleta passa a consultar também por rede de origem (Netflix, Prime Video, Disney+, Apple TV, HBO Max, Paramount+, Crunchyroll) e a plataforma é deduzida do nome da rede quando o TMDB não informa (só redes que são streaming; canal de TV não entra). Séries na janela: 92 para 172.
- Limite: o mesmo furo existe para filmes originais sem provedor; eles só entram se tiverem data digital/física no TMDB.

## 0.2.0 — 24/11/2026

- Catálogo completo: tudo que está disponível por assinatura, grátis ou com anúncios no Brasil, por plataforma (53 plataformas, ~59 mil títulos únicos; a coleta faz ~3.700 consultas ao TMDB em ~2,5 min). Página `/catalogo/` com busca entre plataformas ("onde assistir?") e uma página por plataforma (`/catalogo/<plataforma>.html`) com busca, filtro por tipo e gênero, ordem (popularidade, nota, ano, A a Z) e "Mostrar mais". Os 48 mais populares já vêm no HTML.
- Menu Semana / Catálogo no cabeçalho; a CSP ganhou `connect-src 'self'` (o catálogo carrega JSON do próprio site).
- O catálogo não vai para o git (`dados/catalogo/`, muda todo dia); o workflow guarda o último em cache.
- Limites: o TMDB corta cada consulta em 10 mil resultados (Plex Filmes bate nesse teto); a nota do catálogo é a do TMDB (IMDb, Rotten Tomatoes e Metacritic só nos cartões de lançamento, pelo limite de 1.000 consultas por dia da OMDb).

## 0.1.5 — 24/11/2026

- Corrigido: abrir `public/index.html` direto do disco (duplo clique) deixava a página sem estilo e os botões "Todos juntos" / "Por dia" sem efeito, porque os links do site eram absolutos (`/assets/app.js` apontava para a raiz da unidade). Agora links, CSS, JS e ícone saem relativos (`../assets/...` nas páginas de semana); a 404 continua absoluta, porque o servidor a entrega em qualquer profundidade.
- `testar` confere que links relativos e arquivos do site existem e recusa caminho absoluto de CSS/JS/SVG.

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
