// Temas do site: o Padrão (raiz) e dois visuais alternativos da página da semana (Instagram e Lens),
// gerados em /instagram/ e /lens/. O seletor fica no menu superior de todas as páginas.

export const TEMAS = [
  { id: 'padrao', nome: 'Padrão' },
  { id: 'instagram', nome: 'Instagram' },
  { id: 'lens', nome: 'Lens' },
  { id: 'apple', nome: 'Apple' },
];

/** Endereço do tema; com `slug`, a mesma semana naquele tema. */
export function urlTema(id, slug = null) {
  if (id === 'padrao') return slug ? `/semana/${slug}.html` : '/';
  return slug ? `/${id}/semana/${slug}.html` : `/${id}/`;
}

/** Menu "Tema: Padrão · Instagram · Lens". O tema.js guarda a escolha e leva o visitante ao tema salvo. */
export function seletorTemas(atual, slug = null) {
  return `<nav class="temas" aria-label="Tema do site" data-atual="${atual}"><span class="temas-rot">Tema</span>${TEMAS.map((t) =>
    `<a href="${urlTema(t.id, slug)}" data-tema="${t.id}"${t.id === atual ? ' aria-current="true"' : ''}>${t.nome}</a>`).join('')}</nav>`;
}
