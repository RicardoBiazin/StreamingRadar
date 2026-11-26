// Catálogo: busca, filtros, ordem e "mostrar mais" no navegador (JSON por plataforma),
// e busca entre plataformas na página do índice. Sem JS, o HTML mostra os mais populares.
(function () {
  var IMG = 'https://image.tmdb.org/t/p/w185/';
  var PASSO = 48;

  function semAcento(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function link(href, txt) {
    var a = el('a', null, txt);
    a.href = href; a.rel = 'noopener';
    return a;
  }
  function nota1(n) { return n.toFixed(1).replace('.', ','); }

  // ---------- página de uma plataforma ----------
  var raiz = document.getElementById('catalogo');
  if (raiz) {
    var campo = document.getElementById('c-busca');
    var selTipo = document.getElementById('c-tipo');
    var selGen = document.getElementById('c-gen');
    var selOrd = document.getElementById('c-ord');
    var status = document.getElementById('c-status');
    var botao = document.getElementById('c-mais');
    var dados = null, nomes = {}, visiveis = [], mostrados = 0, timer = null, tipoSel = '', genSel = '';

    var cartao = function (i) {
      var tipo = i[0], id = i[1], titulo = i[2], ano = i[3], nota = i[4], poster = i[6], gen = i[7];
      var url = 'https://www.themoviedb.org/' + (tipo ? 'tv' : 'movie') + '/' + id;
      var a = el('article', 'mini');
      a.setAttribute('data-tipo', tipo ? 'tv' : 'movie'); a.setAttribute('data-id', String(id));
      var capa = el('a', 'capa'); capa.href = url; capa.rel = 'noopener';
      if (poster) {
        var img = el('img', 'poster');
        img.src = IMG + poster; img.alt = 'Pôster de ' + titulo; img.width = 185; img.height = 278;
        img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
        capa.appendChild(img);
      } else {
        var sem = el('div', 'poster sem', titulo.slice(0, 1)); sem.setAttribute('aria-hidden', 'true');
        capa.appendChild(sem);
      }
      var info = el('div', 'mini-info');
      var h = el('h3'); h.appendChild(link(url, titulo)); info.appendChild(h);
      var meta = [ano, tipo ? 'Série' : 'Filme'].concat(gen.slice(0, 2).map(function (g) { return nomes[g]; })).filter(Boolean).join(' · ');
      info.appendChild(el('p', 'meta', meta));
      if (nota) { var n = el('p', 'nota-mini', '★ ' + nota1(nota) + ' '); n.appendChild(el('span', null, 'TMDB')); info.appendChild(n); }
      var l = el('p', 'links');
      l.appendChild(link(url, 'TMDB')); l.appendChild(document.createTextNode(' · '));
      l.appendChild(link('https://www.justwatch.com/br/busca?q=' + encodeURIComponent(titulo), 'JustWatch'));
      info.appendChild(l);
      a.appendChild(capa); a.appendChild(info);
      return a;
    };

    var desenhar = function (reiniciar) {
      if (reiniciar) { raiz.textContent = ''; mostrados = 0; }
      var fim = Math.min(visiveis.length, mostrados + PASSO);
      var frag = document.createDocumentFragment();
      for (var k = mostrados; k < fim; k++) frag.appendChild(cartao(visiveis[k]));
      raiz.appendChild(frag);
      mostrados = fim;
      botao.hidden = mostrados >= visiveis.length;
      status.textContent = visiveis.length === dados.i.length
        ? visiveis.length.toLocaleString('pt-BR') + ' títulos'
        : visiveis.length.toLocaleString('pt-BR') + ' de ' + dados.i.length.toLocaleString('pt-BR') + ' títulos';
      if (!visiveis.length) raiz.appendChild(el('p', 'vazio', 'Nenhum título com esses filtros.'));
    };

    var filtrar = function () {
      var q = semAcento(campo.value.trim());
      var tipo = tipoSel, gen = genSel !== '' ? Number(genSel) : null, ord = selOrd.value;
      visiveis = dados.i.filter(function (i) {
        if (tipo !== '' && String(i[0]) !== tipo) return false;
        if (gen !== null && i[7].indexOf(gen) === -1) return false;
        return !q || i[8].indexOf(q) !== -1;
      });
      if (ord === 'nota') {
        // nota de poucos votos engana: quem tem menos de 50 votos vai para o fim
        visiveis.sort(function (a, b) { return (b[5] >= 50 ? b[4] : -1) - (a[5] >= 50 ? a[4] : -1); });
      } else if (ord === 'ano') {
        visiveis.sort(function (a, b) { return (b[3] || 0) - (a[3] || 0); });
      } else if (ord === 'az') {
        visiveis.sort(function (a, b) { return a[2].localeCompare(b[2], 'pt-BR'); });
      }
      desenhar(true);
    };

    var agendar = function () { clearTimeout(timer); timer = setTimeout(filtrar, 150); };

    fetch(raiz.getAttribute('data-json')).then(function (r) { return r.json(); }).then(function (j) {
      dados = j; nomes = j.g;
      // a ordem do arquivo é a popularidade; i[8] = título sem acento para a busca
      dados.i.forEach(function (i) { i[8] = semAcento(i[2]); });
      campo.addEventListener('input', agendar);
      selOrd.addEventListener('change', filtrar);
      // tipo e gênero: faixas de botões (como as categorias dos serviços de streaming)
      var ligar = function (grupo, definir) {
        grupo.addEventListener('click', function (e) {
          var b = e.target.closest ? e.target.closest('button[data-v]') : null;
          if (!b) return;
          definir(b.getAttribute('data-v'));
          [].forEach.call(grupo.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          filtrar();
        });
      };
      ligar(selTipo, function (v) { tipoSel = v; });
      ligar(selGen, function (v) { genSel = v; });
      botao.addEventListener('click', function () { desenhar(false); });
      filtrar();
    }).catch(function () { status.textContent = 'Não foi possível carregar o catálogo; mostrando os mais populares.'; });
  }

  // ---------- busca entre plataformas (índice) ----------
  var caixa = document.getElementById('b-busca');
  if (caixa) {
    var lista = document.getElementById('b-resultados');
    var fonte = document.getElementById('b-plats').getAttribute('data-json');
    var busca = null, carregando = false, t2 = null;

    var mostrar = function () {
      var q = semAcento(caixa.value.trim());
      lista.textContent = '';
      if (q.length < 2 || !busca) return;
      var achados = [];
      for (var k = 0; k < busca.i.length && achados.length < 40; k++) {
        if (busca.i[k][5].indexOf(q) !== -1) achados.push(busca.i[k]);
      }
      if (!achados.length) { lista.appendChild(el('li', 'vazio', 'Nada encontrado nas plataformas do catálogo.')); return; }
      achados.forEach(function (i) {
        var li = el('li', 'resultado');
        var t = el('div', 'res-tit');
        t.appendChild(link('https://www.themoviedb.org/' + (i[0] ? 'tv' : 'movie') + '/' + i[1], i[2]));
        t.appendChild(el('span', 'meta', ' ' + [i[3], i[0] ? 'Série' : 'Filme'].filter(Boolean).join(' · ')));
        li.appendChild(t);
        var ps = el('div', 'onde');
        i[4].forEach(function (p) {
          var a = el('a', 'chip', busca.p[p].n);
          a.href = '/catalogo/' + busca.p[p].s + '.html';
          ps.appendChild(a);
        });
        li.appendChild(ps);
        lista.appendChild(li);
      });
    };

    caixa.addEventListener('input', function () {
      if (!busca && !carregando) {
        carregando = true;
        fetch(fonte).then(function (r) { return r.json(); }).then(function (j) {
          j.i.forEach(function (i) { i[5] = semAcento(i[2]); });
          busca = j; mostrar();
        });
      }
      clearTimeout(t2); t2 = setTimeout(mostrar, 120);
    });
  }
})();
