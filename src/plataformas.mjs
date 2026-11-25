// Site de cada plataforma de streaming (pelo nome que o TMDB/JustWatch usa).
// Quem não estiver aqui aponta para a página "onde assistir" do JustWatch do título.
// A ordem importa: o primeiro que casar vale (mais específico antes).
const SITES = [
  [/mercado play/i, 'https://play.mercadolivre.com.br/'],
  [/netflix/i, 'https://www.netflix.com/br/'],
  [/prime video|amazon video/i, 'https://www.primevideo.com/'],
  [/disney/i, 'https://www.disneyplus.com/pt-br'],
  [/\bmax\b|hbo/i, 'https://www.hbomax.com/br/pt'],
  [/apple tv/i, 'https://tv.apple.com/br'],
  [/globoplay/i, 'https://globoplay.globo.com/'],
  [/paramount/i, 'https://www.paramountplus.com/br/'],
  [/telecine/i, 'https://telecine.globo.com/'],
  [/claro tv/i, 'https://www.clarotvmais.com.br/'],
  [/claro/i, 'https://www.clarovideo.com/brasil'],
  [/pluto/i, 'https://pluto.tv/br'],
  [/looke/i, 'https://www.looke.com.br/'],
  [/tv brasil/i, 'https://tvbrasilplay.com.br/'],
  [/mubi/i, 'https://mubi.com/pt'],
  [/crunchyroll/i, 'https://www.crunchyroll.com/pt-br'],
  [/curiosity/i, 'https://curiositystream.com/'],
  [/oldflix/i, 'https://www.oldflix.com.br/'],
  [/belas artes/i, 'https://www.belasartesalacarte.com.br/'],
  [/netmovies/i, 'https://www.netmovies.com.br/'],
  [/imovision/i, 'https://www.reservaimovision.com.br/'],
  [/univer/i, 'https://www.univervideo.com/'],
  [/filmicca/i, 'https://www.filmicca.com.br/'],
  [/cultpix/i, 'https://cultpix.com/'],
  [/\bplex\b/i, 'https://watch.plex.tv/'],
  [/magellan/i, 'https://www.magellantv.com/'],
  [/runtime/i, 'https://runtime.tv/'],
  [/moviesaints/i, 'https://www.moviesaints.com/'],
  [/broadwayhd/i, 'https://www.broadwayhd.com/'],
  [/docsville/i, 'https://www.docsville.com/'],
  [/youtube/i, 'https://www.youtube.com/'],
  [/google play/i, 'https://play.google.com/store/movies'],
];

export function sitePlataforma(nome) {
  return SITES.find(([re]) => re.test(nome))?.[1] || null;
}
