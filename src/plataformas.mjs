// Site de cada plataforma de streaming (pelo nome que o TMDB/JustWatch usa).
// Quem não estiver aqui aponta para a página "onde assistir" do JustWatch.
const SITES = [
  [/netflix/i, 'https://www.netflix.com/br/'],
  [/prime video|amazon/i, 'https://www.primevideo.com/'],
  [/disney/i, 'https://www.disneyplus.com/pt-br'],
  [/\bmax\b|hbo/i, 'https://www.hbomax.com/br/pt'],
  [/apple tv/i, 'https://tv.apple.com/br'],
  [/globoplay/i, 'https://globoplay.globo.com/'],
  [/paramount/i, 'https://www.paramountplus.com/br/'],
  [/telecine/i, 'https://www.telecineplay.com.br/'],
  [/claro/i, 'https://www.clarovideo.com/brasil'],
  [/mubi/i, 'https://mubi.com/pt'],
  [/crunchyroll/i, 'https://www.crunchyroll.com/pt-br'],
  [/youtube/i, 'https://www.youtube.com/'],
  [/google play/i, 'https://play.google.com/store/movies'],
];

export function sitePlataforma(nome) {
  return SITES.find(([re]) => re.test(nome))?.[1] || null;
}
