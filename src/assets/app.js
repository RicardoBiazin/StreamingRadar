// Modo de exibição (todos juntos / por dia) e filtros da semana (gênero e plataforma).
// Sem JS a página mostra tudo, no modo "todos juntos".
(function () {
  var main = document.querySelector('main');
  var botoes = [].slice.call(document.querySelectorAll('.vista button'));

  function vista(v) {
    main.setAttribute('data-vista', v);
    botoes.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-vista') === v)); });
    try { localStorage.setItem('sr-vista', v); } catch (e) {}
  }
  botoes.forEach(function (b) { b.addEventListener('click', function () { vista(b.getAttribute('data-vista')); }); });
  try { var salvo = localStorage.getItem('sr-vista'); if (salvo === 'dia' || salvo === 'junto') vista(salvo); } catch (e) {}

  var sel = document.getElementById('f-plat');
  var chips = document.getElementById('f-gen');
  if (!sel && !chips) return;
  var cartoes = [].slice.call(document.querySelectorAll('.card'));
  var vazio = document.getElementById('sem-filtro');
  var genero = '';

  function tem(c, attr, valor) {
    return (' ' + (c.getAttribute(attr) || '') + ' ').indexOf(' ' + valor + ' ') !== -1;
  }

  function aplicar() {
    var plat = sel ? sel.value : '';
    cartoes.forEach(function (c) {
      // Plataforma só vale para streaming: cartões de cinema (sem plataforma) saem quando há filtro.
      c.hidden = (!!plat && !tem(c, 'data-plat', plat)) || (!!genero && !tem(c, 'data-gen', genero));
    });
    [].forEach.call(document.querySelectorAll('.dia'), function (d) {
      d.hidden = !d.querySelector('.card:not([hidden])');
    });
    // contagens das seções acompanham o filtro
    [].forEach.call(document.querySelectorAll('section.bloco'), function (s) {
      var n = s.querySelectorAll('.card:not([hidden])').length;
      var h = s.querySelector('h2 .qtd'); if (h) h.textContent = n;
      var aba = document.querySelector('.abas a[href="#' + s.id + '"] .qtd'); if (aba) aba.textContent = n;
    });
    if (chips) {
      [].forEach.call(chips.querySelectorAll('button'), function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-gen') === genero));
      });
    }
    var filtrando = !!plat || !!genero;
    vazio.hidden = !filtrando || !!document.querySelector('.card:not([hidden])');
    var h2 = [];
    if (plat) h2.push('plat=' + plat);
    if (genero) h2.push('gen=' + genero);
    try { history.replaceState(null, '', h2.length ? '#' + h2.join('&') : location.pathname); } catch (e) {}
  }

  var mp = /[#&]plat=([a-z0-9-]+)/.exec(location.hash);
  if (sel && mp && sel.querySelector('option[value="' + mp[1] + '"]')) sel.value = mp[1];
  var mg = /[#&]gen=([a-z0-9-]+)/.exec(location.hash);
  if (chips && mg && chips.querySelector('button[data-gen="' + mg[1] + '"]')) genero = mg[1];
  if (sel) sel.addEventListener('change', aplicar);
  if (chips) chips.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button[data-gen]') : null;
    if (!b) return;
    genero = b.getAttribute('data-gen');
    aplicar();
  });
  aplicar();
})();
