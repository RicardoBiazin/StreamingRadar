// Filtros do modelo "linkedin": abas por tipo, gênero e plataforma, "ver mais" na sinopse.
// Sem este arquivo a página mostra todos os lançamentos.
(function () {
  'use strict';
  var raiz = document.documentElement;
  raiz.classList.add('js');

  var posts = [].slice.call(document.querySelectorAll('.post'));
  var secoes = [].slice.call(document.querySelectorAll('.secao'));
  var abas = [].slice.call(document.querySelectorAll('.aba'));
  var chips = [].slice.call(document.querySelectorAll('.chip'));
  var limpar = document.querySelector('.limpar');
  var vazio = document.getElementById('vazio');
  var resumo = document.getElementById('resumo');
  var filtros = document.getElementById('filtros');
  var estado = { tipo: 'tudo', gen: '', plat: '' };

  function tem(lista, valor) { return (' ' + lista + ' ').indexOf(' ' + valor + ' ') > -1; }

  function aplicar() {
    var total = 0;
    posts.forEach(function (p) {
      var ok = (estado.tipo === 'tudo' || p.getAttribute('data-tipo') === estado.tipo) &&
        (!estado.gen || tem(p.getAttribute('data-gen'), estado.gen)) &&
        (!estado.plat || tem(p.getAttribute('data-plat'), estado.plat));
      p.hidden = !ok;
      if (ok) total++;
    });
    secoes.forEach(function (s) {
      var n = s.querySelectorAll('.post:not([hidden])').length;
      var q = s.querySelector('.qtd');
      var tot = q.getAttribute('data-total');
      q.textContent = String(n) === tot ? tot : n + ' de ' + tot;
      s.hidden = n === 0;
    });
    abas.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('data-tipo') === estado.tipo ? 'true' : 'false'); });
    chips.forEach(function (c) {
      var g = c.getAttribute('data-gen'), p = c.getAttribute('data-plat');
      c.setAttribute('aria-pressed', (g && g === estado.gen) || (p && p === estado.plat) ? 'true' : 'false');
    });
    var filtrado = estado.gen || estado.plat || estado.tipo !== 'tudo';
    if (limpar) limpar.hidden = !(estado.gen || estado.plat);
    vazio.hidden = total > 0;
    resumo.textContent = total + (total === 1 ? ' lançamento' : ' lançamentos') + (filtrado ? ' no filtro' : '');
  }

  function limparTudo() { estado.gen = ''; estado.plat = ''; aplicar(); }

  abas.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      estado.tipo = a.getAttribute('data-tipo');
      aplicar();
      var alvo = document.getElementById('feed');
      if (alvo && alvo.getBoundingClientRect().top < 0) alvo.scrollIntoView();
    });
  });

  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var g = c.getAttribute('data-gen'), p = c.getAttribute('data-plat');
      if (g) estado.gen = estado.gen === g ? '' : g;
      if (p) estado.plat = estado.plat === p ? '' : p;
      aplicar();
    });
  });

  if (limpar) limpar.addEventListener('click', limparTudo);
  var vl = document.getElementById('vazio-limpar');
  if (vl) vl.addEventListener('click', function () { estado.tipo = 'tudo'; limparTudo(); });

  // gêneros do post (#Drama) também filtram
  [].forEach.call(document.querySelectorAll('.hash'), function (h) {
    h.setAttribute('role', 'button');
    h.setAttribute('tabindex', '0');
    function usar() {
      estado.gen = h.getAttribute('data-gen');
      aplicar();
      var alvo = document.getElementById('feed');
      if (alvo) alvo.scrollIntoView();
    }
    h.addEventListener('click', usar);
    h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); usar(); } });
  });

  // links de seção (barra inferior, perfil) mostram a seção mesmo que o filtro de tipo a esconda
  [].forEach.call(document.querySelectorAll('.nav-inf a, .stats a, .nav a[href^="#"]'), function (a) {
    a.addEventListener('click', function () { if (estado.tipo !== 'tudo') { estado.tipo = 'tudo'; aplicar(); } });
  });

  // "ver mais" na sinopse
  function verMais() {
    [].forEach.call(document.querySelectorAll('.sinopse'), function (p) {
      if (p.getAttribute('data-vm') || p.closest('[hidden]')) return;
      if (p.scrollHeight <= p.clientHeight + 1) return;
      p.setAttribute('data-vm', '1');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ver-mais';
      b.textContent = 'ver mais';
      b.setAttribute('aria-expanded', 'false');
      b.addEventListener('click', function () {
        var aberta = p.classList.toggle('aberta');
        b.textContent = aberta ? 'ver menos' : 'ver mais';
        b.setAttribute('aria-expanded', aberta ? 'true' : 'false');
      });
      p.parentNode.insertBefore(b, p.nextSibling);
    });
  }

  // filtros começam fechados no celular, abertos no computador
  var mq = window.matchMedia ? window.matchMedia('(max-width: 760px)') : null;
  function ajustarFiltros() {
    if (!filtros || !mq) return;
    if (mq.matches) filtros.removeAttribute('open'); else filtros.setAttribute('open', '');
  }
  ajustarFiltros();
  if (mq && mq.addEventListener) mq.addEventListener('change', ajustarFiltros);

  // semana atual visível na lista da direita
  var atual = document.querySelector('.semanas-lista .atual');
  if (atual && atual.parentNode && atual.parentNode.parentNode) {
    var cx = atual.parentNode.parentNode;
    cx.scrollTop = Math.max(0, atual.offsetTop - cx.clientHeight / 2 + atual.offsetHeight / 2);
  }

  aplicar();
  verMais();
})();
