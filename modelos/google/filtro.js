/* Modelo "google": abas, chips de gênero/plataforma e busca por título. Sem JS tudo continua visível. */
(function () {
  'use strict';
  var raiz = document.documentElement;
  raiz.className += ' js';

  function norm(s) {
    s = String(s || '').toLowerCase();
    try { s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) { /* navegador antigo */ }
    return s;
  }
  function todos(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var itens = todos('.res');
  var secoes = todos('.sec');
  var abas = todos('.abas a');
  var chipsGen = todos('.chip[data-gen]');
  var chipsPlat = todos('.chip[data-plat]');
  var caixa = document.getElementById('q');
  var stats = document.getElementById('stats');
  var limpar = document.querySelector('.limpar');
  var nada = document.querySelector('.nada');
  var estado = { aba: 'tudo', gen: '', plat: '', q: '' };

  itens.forEach(function (li) { li.setAttribute('data-busca', norm(li.getAttribute('data-titulo'))); });

  function tem(lista, v) { return (' ' + lista + ' ').indexOf(' ' + v + ' ') !== -1; }

  function aplicar() {
    var total = 0;
    var porTipo = { cinema: 0, filme: 0, serie: 0 };
    itens.forEach(function (li) {
      var ok = (estado.aba === 'tudo' || li.getAttribute('data-tipo') === estado.aba) &&
        (!estado.gen || tem(li.getAttribute('data-gen'), estado.gen)) &&
        (!estado.plat || tem(li.getAttribute('data-plat'), estado.plat)) &&
        (!estado.q || li.getAttribute('data-busca').indexOf(estado.q) !== -1);
      li.hidden = !ok;
      if (ok) { total++; porTipo[li.getAttribute('data-tipo')]++; }
    });
    secoes.forEach(function (sec) {
      var t = sec.getAttribute('data-tipo');
      sec.hidden = porTipo[t] === 0;
      var c = sec.querySelector('[data-conta]');
      if (c) c.textContent = porTipo[t];
    });
    if (stats) stats.textContent = total === 1 ? '1 resultado' : total + ' resultados';
    if (nada) nada.hidden = total !== 0;
    if (limpar) limpar.hidden = !(estado.gen || estado.plat || estado.q);
  }

  function marcarAba(nome) {
    abas.forEach(function (a) {
      if (a.getAttribute('data-aba') === nome) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function aba(nome) { estado.aba = nome; marcarAba(nome); aplicar(); }

  abas.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      aba(a.getAttribute('data-aba'));
      var alvo = document.getElementById('resultados');
      if (alvo && alvo.scrollIntoView) alvo.scrollIntoView({ block: 'start' });
    });
  });

  function chips(lista, chave) {
    lista.forEach(function (c) {
      c.addEventListener('click', function () {
        var v = c.getAttribute('data-' + chave);
        estado[chave] = estado[chave] === v ? '' : v;
        lista.forEach(function (o) { o.setAttribute('aria-pressed', o.getAttribute('data-' + chave) === estado[chave] ? 'true' : 'false'); });
        aplicar();
      });
    });
  }
  chips(chipsGen, 'gen');
  chips(chipsPlat, 'plat');

  if (caixa) {
    caixa.addEventListener('input', function () { estado.q = norm(caixa.value.trim()); aplicar(); });
    caixa.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });
  }

  if (limpar) {
    limpar.addEventListener('click', function () {
      estado.gen = ''; estado.plat = ''; estado.q = '';
      chipsGen.concat(chipsPlat).forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      if (caixa) caixa.value = '';
      aplicar();
    });
  }

  var h = (location.hash || '').replace('#', '');
  var mapa = { cinema: 'cinema', filmes: 'filme', series: 'serie' };
  if (mapa[h]) aba(mapa[h]);
})();
