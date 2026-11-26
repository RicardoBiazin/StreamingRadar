// Filtros por gênero e plataforma, tema claro/escuro e destaque do menu do modelo "tiktok".
// Sem JS a página mostra tudo; os filtros e o botão de tema só aparecem com JS.
(function () {
  var raiz = document.documentElement;

  // tema (escuro por padrão; claro é opcional e fica guardado no navegador)
  var botao = document.querySelector('.tema');
  function guardado() { try { return localStorage.getItem('sr-tiktok-tema'); } catch (e) { return null; } }
  function aplicar(t) {
    if (t === 'claro') raiz.setAttribute('data-tema', 'claro'); else raiz.removeAttribute('data-tema');
    if (botao) botao.setAttribute('aria-pressed', t === 'claro' ? 'true' : 'false');
  }
  if (botao) {
    botao.hidden = false;
    aplicar(guardado());
    botao.addEventListener('click', function () {
      var novo = raiz.getAttribute('data-tema') === 'claro' ? 'escuro' : 'claro';
      aplicar(novo);
      try { localStorage.setItem('sr-tiktok-tema', novo); } catch (e) { /* sem armazenamento */ }
    });
  }

  // filtros
  var painel = document.querySelector('.filtros');
  var cartoes = Array.prototype.slice.call(document.querySelectorAll('.cartao'));
  var areas = Array.prototype.slice.call(document.querySelectorAll('.area'));
  var estado = document.querySelector('.fil-estado');
  var sel = { gen: '', plat: '' };

  function tem(c, chave, valor) {
    if (!valor) return true;
    return (' ' + (c.getAttribute('data-' + chave) || '') + ' ').indexOf(' ' + valor + ' ') !== -1;
  }

  function filtrar() {
    var total = 0;
    cartoes.forEach(function (c) {
      var ok = tem(c, 'gen', sel.gen) && tem(c, 'plat', sel.plat);
      c.hidden = !ok;
      if (ok) total++;
    });
    areas.forEach(function (a) {
      var cs = a.querySelectorAll('.cartao');
      var vis = 0;
      for (var i = 0; i < cs.length; i++) if (!cs[i].hidden) vis++;
      var conta = a.querySelector('.conta');
      if (conta) {
        var t = Number(conta.getAttribute('data-total'));
        conta.textContent = vis === t ? t + (t === 1 ? ' título' : ' títulos') : vis + ' de ' + t;
      }
      var vazio = a.querySelector('.vazio-area');
      if (vazio) vazio.hidden = vis > 0 || (!sel.gen && !sel.plat);
    });
    if (estado) estado.textContent = (sel.gen || sel.plat) ? total + ' lançamentos com esses filtros.' : '';
  }

  if (painel) {
    painel.hidden = false;
    painel.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.chip[data-filtro]') : null;
      if (!b) return;
      var chave = b.getAttribute('data-filtro');
      var valor = b.getAttribute('data-valor') || '';
      sel[chave] = (sel[chave] === valor) ? '' : valor;
      Array.prototype.forEach.call(painel.querySelectorAll('.chip[data-filtro="' + chave + '"]'), function (c) {
        var on = (c.getAttribute('data-valor') || '') === sel[chave];
        c.classList.toggle('ativo', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      filtrar();
    });
  }

  // "Em alta" leva ao cartão: se ele estiver escondido por um filtro, limpa os filtros
  Array.prototype.forEach.call(document.querySelectorAll('.alta-item'), function (a) {
    a.addEventListener('click', function () {
      var alvo = document.getElementById((a.getAttribute('href') || '').slice(1));
      if (alvo && alvo.hidden && painel) {
        sel.gen = ''; sel.plat = '';
        Array.prototype.forEach.call(painel.querySelectorAll('.chip[data-filtro]'), function (c) {
          var on = !c.getAttribute('data-valor');
          c.classList.toggle('ativo', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        filtrar();
      }
    });
  });

  // destaque do item do menu conforme a área visível
  var links = Array.prototype.slice.call(document.querySelectorAll('.menu a[href^="#"]'));
  if (window.IntersectionObserver && links.length) {
    var pontos = ['topo', 'cinema', 'filmes', 'series'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) {
          var on = l.getAttribute('href') === '#' + en.target.id;
          l.classList.toggle('ativo', on);
          if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    pontos.forEach(function (p) { obs.observe(p); });
  }
})();
