// Modo de exibição (todos juntos / por dia) e filtro por plataforma.
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
  if (!sel) return;
  var cartoes = [].slice.call(document.querySelectorAll('.card'));
  var vazio = document.getElementById('sem-filtro');

  function aplicar() {
    var v = sel.value;
    cartoes.forEach(function (c) {
      var plat = ' ' + (c.getAttribute('data-plat') || '') + ' ';
      // O filtro vale para streaming; cartões de cinema (sem plataforma) saem quando há filtro.
      c.hidden = !!v && plat.indexOf(' ' + v + ' ') === -1;
    });
    [].forEach.call(document.querySelectorAll('.dia'), function (d) {
      d.hidden = !d.querySelector('.card:not([hidden])');
    });
    vazio.hidden = !v || !!document.querySelector('.card:not([hidden])');
    try { history.replaceState(null, '', v ? '#plat=' + v : location.pathname); } catch (e) {}
  }

  var m = /#plat=([a-z0-9-]+)/.exec(location.hash);
  if (m && sel.querySelector('option[value="' + m[1] + '"]')) sel.value = m[1];
  sel.addEventListener('change', aplicar);
  aplicar();
})();
