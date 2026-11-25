// Filtro por plataforma (só esconde cartões; sem o JS a página mostra tudo).
(function () {
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
