// Filtro por gênero (chips de resposta) e lista de semanas em tela cheia no celular.
// Sem este arquivo a página mostra tudo e a lista de semanas abre por âncora (#semanas).
(function () {
  'use strict';
  var html = document.documentElement;

  var filtros = document.querySelector('[data-filtros]');
  if (filtros) {
    filtros.hidden = false;
    var chips = filtros.querySelectorAll('.chip');
    var msgs = document.querySelectorAll('.msg[data-gen]');
    var secoes = document.querySelectorAll('[data-secao]');
    var estado = document.querySelector('[data-estado]');
    var total = msgs.length;

    var aplicar = function (g) {
      var visiveis = 0;
      var i, j;
      for (i = 0; i < msgs.length; i++) {
        var ok = !g || (' ' + msgs[i].getAttribute('data-gen') + ' ').indexOf(' ' + g + ' ') !== -1;
        msgs[i].hidden = !ok;
        if (ok) visiveis++;
      }
      for (i = 0; i < secoes.length; i++) {
        var grupos = secoes[i].querySelectorAll('.grupo-dia');
        var n = 0;
        for (j = 0; j < grupos.length; j++) {
          var q = grupos[j].querySelectorAll('.msg:not([hidden])').length;
          grupos[j].hidden = q === 0;
          n += q;
        }
        var c = secoes[i].querySelector('[data-conta]');
        if (c) c.textContent = n;
        var v = secoes[i].querySelector('.vazio');
        if (v) v.hidden = n !== 0;
        var enviada = secoes[i].querySelector('.enviada');
        if (enviada) enviada.hidden = n === 0;
      }
      for (i = 0; i < chips.length; i++) {
        chips[i].setAttribute('aria-pressed', (chips[i].getAttribute('data-g') || '') === (g || '') ? 'true' : 'false');
      }
      if (estado) {
        estado.textContent = g ? 'Mostrando ' + visiveis + ' de ' + total + ' lançamentos.' : '';
      }
    };

    for (var k = 0; k < chips.length; k++) {
      chips[k].addEventListener('click', function () {
        aplicar(this.getAttribute('data-g') || '');
      });
    }
  }

  // lista de semanas como tela cheia no celular (sem JS, o :target faz o mesmo)
  var abrir = document.querySelector('[data-abrir]');
  var lateral = document.getElementById('semanas');
  if (abrir && lateral) {
    var y = 0;
    var mostrar = function (sim) {
      if (sim) y = window.pageYOffset;
      html.classList.toggle('ver-semanas', sim);
      if (!sim) window.scrollTo(0, y);
    };
    abrir.addEventListener('click', function (e) {
      e.preventDefault();
      mostrar(true);
      var a = lateral.querySelector('.atual');
      if (a) a.focus();
    });
    var fechar = lateral.querySelector('[data-fechar]');
    if (fechar) {
      fechar.addEventListener('click', function (e) {
        e.preventDefault();
        mostrar(false);
        abrir.focus();
      });
    }
    var atual = lateral.querySelector('.atual');
    if (atual) {
      atual.addEventListener('click', function (e) {
        if (html.classList.contains('ver-semanas')) { e.preventDefault(); mostrar(false); }
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && html.classList.contains('ver-semanas')) { mostrar(false); abrir.focus(); }
    });
  }
})();
