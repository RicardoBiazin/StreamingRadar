# Contrato para criar um modelo de layout do Streaming Radar

Projeto: `V:\DEV\Streaming Radar`. O site oficial está em `public/` (gerado por `scripts/gerar.mjs` e `src/`) e **não pode ser alterado**.
Não edite nada fora de `modelos/<seu-id>/`. Não faça commit, push nem deploy.

Cada modelo é a mesma página (a **semana atual**, com os **dados reais**) em outro estilo visual **e outra estrutura de tela**, inspirado num site/app de referência. Não basta trocar cor: pense na organização (feed, grade, lista, cartões, abas...) como o app de referência faz, adaptada para mostrar lançamentos de cinema e streaming.

## O que entregar

Em `modelos/<id>/`:

1. **`modelo.mjs`** (obrigatório). Exporta:
   - `export const meta = { nome, inspiracao, descricao }`: `nome` curto do estilo em PT-BR (ex.: "Feed de stories"), `inspiracao` = site de referência, `descricao` = uma frase.
   - `export function render(d)`: devolve o HTML completo (`<!doctype html>` ... `</html>`). `d` vem de `../_base.mjs` (`carregar()`); leia esse arquivo para ver a forma dos dados (semana, itens, gêneros, plataformas, redes, créditos...). Use `esc` para todo texto vindo dos dados.
   - Use `head(id, d, { titulo })` de `../_base.mjs` para o `<head>` (noindex + `<link>` para `/<id>/estilo.css`) e `creditos(d)` para o bloco de créditos (ou escreva o seu mantendo o mesmo conteúdo).
2. **`estilo.css`** (obrigatório), caminhos sempre absolutos `/<id>/arquivo`.
3. Opcionais: `filtro.js` (ou outro `.js`), `.svg`/`.png`/`.woff2` que você mesmo criar. Tudo dentro de `modelos/<id>/`. Não copie logotipo nem marca registrada do site de referência; **inspire-se no estilo** (cores, formas, espaçamento, tipografia, padrões de navegação), não imite a marca. Pode desenhar ícones SVG simples próprios.

## Regras técnicas (a CSP do site é rígida)

- **Nenhum `<script>` inline e nenhum `<style>` ou atributo `style="..."` inline.** Script só como arquivo (`<script src="/<id>/filtro.js" defer></script>`), CSS só em `estilo.css`.
- Imagens: só `https://image.tmdb.org` (pôsteres e logos vêm prontos nos dados), arquivos do modelo e `data:`. Nada de fonte nem imagem de CDN externo. Fontes: pilha do sistema (`system-ui`, `-apple-system`, `Segoe UI`, `Roboto`...) ou arquivos próprios.
- Sem `fetch` para fora do próprio site.
- Responsivo: funcionar em 1280 px e em 390 px, sem rolagem horizontal da página. Suportar `prefers-color-scheme` (claro e escuro) quando combinar com a referência.
- Acessível: `lang="pt-BR"`, hierarquia de títulos, texto alternativo nos pôsteres, foco visível, contraste suficiente.
- JS é opcional (filtro por gênero/plataforma, abas, favoritos...). A página deve funcionar e mostrar tudo sem ele. Se usar, escreva JS simples (ES5/ES2015), sem bibliotecas, sem `innerHTML` com dado de fora.

## Conteúdo obrigatório (o mesmo do site oficial)

- **Topo:** marca "Streaming Radar" (texto ou SVG próprio), versão `v{d.versao}`, links para o site oficial: Semana (`d.site`) e Catálogo (`d.catalogo.url`).
- **Semana:** título com a faixa (`d.semana.faixa`) e a numeração da semana; navegação para a semana anterior e a próxima (`d.anterior` / `d.proxima`, URLs do site oficial) e acesso a todas as semanas (`d.semanas`).
- **Todos os itens da semana** (`d.semana.itens`, hoje 68), nas três áreas: **cinema**, **filmes no streaming** e **séries**, com a quantidade de cada. Cada item mostra: título (e título original se houver), pôster (ou a inicial se não houver), data de estreia, gêneros, nota TMDB (se houver), sinopse (curta ou expansível), links `tmdbUrl`, `trailerUrl` (se houver) e `justwatchUrl` (se houver).
  - **Cinema:** botões das 7 redes com os links reais (`item.redes`, "Programação nas redes").
  - **Streaming:** plataformas (`item.plataformas`, com logo e link; se `semPlataforma`, mostrar "Plataforma ainda não informada"); série mostra `estreiaTxt` e `canais`.
  - Selos de IMDb/Rotten Tomatoes/Metacritic (`item.selos`) quando existirem.
- **Filtro por gênero** (`d.generos`) e, se fizer sentido, por plataforma (`d.plataformas`): pode ser com JS (`data-gen`/`data-plat` nos itens) ou só com âncoras. Sem JS tudo continua visível.
- **Rodapé:** créditos do TMDB (com o aviso de que não é endossado), JustWatch, OMDb, licença MIT, link do GitHub, versão e a frase "modelo de layout: não é o site oficial" (já em `creditos(d)`).

## Como testar

```
node scripts/modelos.mjs <id>          # gera dist-modelos/<id>/ e confere as regras (CSP, itens, créditos, redes...)
node scripts/modelos.mjs --servir 4310 # http://127.0.0.1:4310/<id>/  (use uma porta só sua; deixe rodando em segundo plano)
```

Confira no navegador (Playwright, emprestado de `V:\DEV\FluxDiag\node_modules\playwright`, importado por `file:///V:/DEV/FluxDiag/node_modules/playwright/index.mjs`) em **1280 px** e **390 px**, claro e escuro: tire capturas, olhe cada uma, e corrija o que estiver quebrado ou feio. Sem rolagem horizontal. Pare o servidor ao terminar.
Guarde scripts e capturas temporários na pasta temporária do sistema (`%TEMP%`), nunca dentro do projeto.

## Ao terminar

Responda com: o que foi entregue (arquivos), a ideia do layout em 2-3 linhas, o resultado de `node scripts/modelos.mjs <id>`, e qualquer limitação.
