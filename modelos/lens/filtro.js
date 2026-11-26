// Filtro por gênero (bolhas). Sem JS tudo continua visível e as bolhas ficam escondidas.
(function () {
  var raiz = document.documentElement;
  raiz.className += ' js';
  var barra = document.querySelector('[data-filtros]');
  if (!barra) return;
  var botoes = barra.querySelectorAll('[data-filtro]');
  var cartoes = document.querySelectorAll('.cartao');
  var areas = document.querySelectorAll('[data-area]');
  var vazio = barra.querySelector('[data-vazio]');

  function aplicar(slug) {
    var total = 0, i, j;
    for (i = 0; i < cartoes.length; i++) {
      var ok = !slug || (cartoes[i].getAttribute('data-gen') || '').indexOf(' ' + slug + ' ') !== -1;
      cartoes[i].hidden = !ok;
      if (ok) total++;
    }
    for (i = 0; i < areas.length; i++) {
      var vis = 0, cs = areas[i].querySelectorAll('.cartao');
      for (j = 0; j < cs.length; j++) if (!cs[j].hidden) vis++;
      areas[i].hidden = vis === 0;
      var c = areas[i].querySelector('[data-conta]');
      if (c) c.textContent = vis;
    }
    if (vazio) vazio.hidden = total !== 0;
    for (i = 0; i < botoes.length; i++) {
      botoes[i].setAttribute('aria-pressed', botoes[i].getAttribute('data-filtro') === slug ? 'true' : 'false');
    }
  }

  for (var k = 0; k < botoes.length; k++) {
    botoes[k].addEventListener('click', function (e) {
      var slug = e.currentTarget.getAttribute('data-filtro');
      var atual = barra.querySelector('[aria-pressed="true"]');
      // clicar no gênero já ativo volta para Todos
      if (atual === e.currentTarget && slug) slug = '';
      aplicar(slug);
    });
  }
})();
