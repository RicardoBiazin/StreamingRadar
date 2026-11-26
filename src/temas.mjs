// Temas do site: o Padrão (raiz) e visuais alternativos (Instagram, Lens, Apple), gerados em /instagram/,
// /lens/ e /apple/: página da semana (modelos/<id>/) e catálogo (a página do Padrão com um "skin" em
// modelos/<id>/catalogo.css). O seletor fica no menu superior de todas as páginas.

export const TEMAS = [
  { id: 'padrao', nome: 'Padrão' },
  { id: 'instagram', nome: 'Instagram' },
  { id: 'lens', nome: 'Lens' },
  { id: 'apple', nome: 'Apple' },
];

/**
 * Endereço de uma página no tema. `ref`: nada = início; texto = semana (slug);
 * { catalogo: 'netflix.html' } = página do catálogo ('' = índice).
 */
export function urlTema(id, ref = null) {
  const pre = id === 'padrao' ? '' : `/${id}`;
  if (ref && typeof ref === 'object') return `${pre}/catalogo/${ref.catalogo || ''}`;
  if (ref) return `${pre}/semana/${ref}.html`;
  return pre ? `${pre}/` : '/';
}

export const urlCatalogo = (id) => urlTema(id, { catalogo: '' });

/** Menu "Tema: Padrão · Instagram · Lens · Apple": cada link leva à mesma página no outro tema. */
export function seletorTemas(atual, ref = null) {
  return `<nav class="temas" aria-label="Tema do site" data-atual="${atual}"><span class="temas-rot">Tema</span>${TEMAS.map((t) =>
    `<a href="${urlTema(t.id, ref)}" data-tema="${t.id}"${t.id === atual ? ' aria-current="true"' : ''}>${t.nome}</a>`).join('')}</nav>`;
}
