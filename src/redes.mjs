// Redes de cinema. Não existe API pública das redes: cada estreia aponta para a
// página de programação da rede (não afirma que a rede exibe o filme).
// Cinépolis bloqueia robôs (403 no curl), mas abre no navegador.
export const REDES = [
  { id: 'cinemark', nome: 'Cinemark', cartaz: 'https://www.cinemark.com.br/filmes/em-cartaz', breve: 'https://www.cinemark.com.br/filmes/em-breve' },
  { id: 'cinepolis', nome: 'Cinépolis', cartaz: 'https://www.cinepolis.com.br/', breve: 'https://www.cinepolis.com.br/' },
  { id: 'uci', nome: 'UCI', cartaz: 'https://www.ucicinemas.com.br/', breve: 'https://www.ucicinemas.com.br/' },
  { id: 'kinoplex', nome: 'Kinoplex', cartaz: 'https://www.kinoplex.com.br/', breve: 'https://www.kinoplex.com.br/' },
  { id: 'moviecom', nome: 'Moviecom', cartaz: 'https://moviecom.com.br/', breve: 'https://moviecom.com.br/' },
  { id: 'playarte', nome: 'Playarte', cartaz: 'https://playartecinemas.com.br/', breve: 'https://playartecinemas.com.br/' },
  { id: 'ingresso', nome: 'Ingresso.com', cartaz: 'https://www.ingresso.com/filmes/em-cartaz', breve: 'https://www.ingresso.com/filmes/em-breve' },
];

// Estreia já passou ou é hoje: "em cartaz"; senão "em breve".
export const linkRede = (rede, dataEstreia, hoje) => (dataEstreia <= hoje ? rede.cartaz : rede.breve);
