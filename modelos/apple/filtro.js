// Filtro por gênero e plataforma + setas das fileiras. Sem JS a página mostra tudo.
(function () {
  var barra = document.getElementById('filtro');
  var selPlat = document.getElementById('f-plat');
  var aviso = document.getElementById('f-aviso');
  var genAtual = '';
  var platAtual = '';

  function tem(el, attr, valor) {
    if (!valor) return true;
    return (' ' + (el.getAttribute(attr) || '') + ' ').indexOf(' ' + valor + ' ') !== -1;
  }

  function aplicar() {
    var total = 0;
    var areas = document.querySelectorAll('.tile[data-area]');
    for (var a = 0; a < areas.length; a++) {
      var area = areas[a];
      var itens = area.querySelectorAll('.cartao, .linha');
      var visiveis = 0;
      for (var i = 0; i < itens.length; i++) {
        var ok = tem(itens[i], 'data-gen', genAtual) && tem(itens[i], 'data-plat', platAtual);
        itens[i].hidden = !ok;
        if (ok && itens[i].classList.contains('linha')) visiveis++;
      }
      var qtd = area.querySelector('.qtd');
      if (qtd) qtd.textContent = visiveis;
      var vazio = area.querySelector('.vazio');
      if (vazio) vazio.hidden = visiveis > 0;
      var fila = area.querySelector('.fileira');
      if (fila) fila.scrollLeft = 0;
      total += visiveis;
    }
    if (aviso) aviso.textContent = total + ' lançamentos exibidos';
  }

  if (barra) {
    barra.hidden = false;
    var chips = barra.querySelectorAll('.chip');
    for (var c = 0; c < chips.length; c++) {
      chips[c].addEventListener('click', function () {
        genAtual = this.getAttribute('data-gen') || '';
        for (var k = 0; k < chips.length; k++) {
          chips[k].setAttribute('aria-pressed', chips[k] === this ? 'true' : 'false');
        }
        aplicar();
      });
    }
    if (selPlat) {
      selPlat.addEventListener('change', function () {
        platAtual = selPlat.value;
        aplicar();
      });
    }
  }

  // setas das fileiras de pôsteres
  var wraps = document.querySelectorAll('.fileira-wrap');
  for (var w = 0; w < wraps.length; w++) {
    (function (wrap) {
      var fila = wrap.querySelector('.fileira');
      var setas = wrap.querySelector('.setas');
      if (!fila || !setas) return;
      setas.hidden = false;
      var botoes = setas.querySelectorAll('.seta');
      for (var b = 0; b < botoes.length; b++) {
        botoes[b].addEventListener('click', function () {
          var dir = Number(this.getAttribute('data-dir'));
          fila.scrollBy({ left: dir * fila.clientWidth * 0.8, behavior: 'smooth' });
        });
      }
    })(wraps[w]);
  }
})();
