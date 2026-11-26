// Catálogo: busca, filtros (tipo, gênero, plataforma), ordem e "mostrar mais" no navegador.
// Duas páginas usam o mesmo motor: a de cada plataforma (JSON próprio) e o índice, que filtra
// todas as plataformas de uma vez (busca.json, carregado só na primeira interação).
// Sem JS, o HTML mostra os mais populares.
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

  // Linha: [tipo(0 filme|1 série), id, título, ano, nota, votos, poster, gêneros, (plataformas)]
  function cartao(i, nomes, plats) {
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
    if (plats && i[8] && i[8].length) {
      var nomesPlat = i[8].map(function (k) { return plats[k].n; });
      info.appendChild(el('p', 'plats-mini', nomesPlat.slice(0, 3).join(' · ') + (nomesPlat.length > 3 ? ' +' + (nomesPlat.length - 3) : '')));
    }
    var l = el('p', 'links');
    l.appendChild(link(url, 'TMDB')); l.appendChild(document.createTextNode(' · '));
    l.appendChild(link('https://www.justwatch.com/br/busca?q=' + encodeURIComponent(titulo), 'JustWatch'));
    info.appendChild(l);
    a.appendChild(capa); a.appendChild(info);
    return a;
  }

  // Motor de listagem. c: { raiz, itens, nomes, plats, campo, ord, selPlat, grupoTipo, grupoGen, status, botao }
  function motor(c) {
    var tipoSel = '', genSel = '', visiveis = [], mostrados = 0, timer = null;
    c.itens.forEach(function (i) { i.q = semAcento(i[2]); });

    function desenhar(reiniciar) {
      if (reiniciar) { c.raiz.textContent = ''; mostrados = 0; }
      var fim = Math.min(visiveis.length, mostrados + PASSO);
      var frag = document.createDocumentFragment();
      for (var k = mostrados; k < fim; k++) frag.appendChild(cartao(visiveis[k], c.nomes, c.plats));
      c.raiz.appendChild(frag);
      mostrados = fim;
      c.botao.hidden = mostrados >= visiveis.length;
      var total = c.itens.length.toLocaleString('pt-BR');
      c.status.textContent = visiveis.length === c.itens.length
        ? total + ' títulos'
        : visiveis.length.toLocaleString('pt-BR') + ' de ' + total + ' títulos';
      if (!visiveis.length) c.raiz.appendChild(el('p', 'vazio', 'Nenhum título com esses filtros.'));
    }

    function filtrar() {
      var q = semAcento(c.campo.value.trim());
      var gen = genSel !== '' ? Number(genSel) : null;
      var plat = c.selPlat && c.selPlat.value !== '' ? Number(c.selPlat.value) : null;
      var ord = c.ord.value;
      visiveis = c.itens.filter(function (i) {
        if (tipoSel !== '' && String(i[0]) !== tipoSel) return false;
        if (gen !== null && i[7].indexOf(gen) === -1) return false;
        if (plat !== null && (!i[8] || i[8].indexOf(plat) === -1)) return false;
        return !q || i.q.indexOf(q) !== -1;
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
    }

    function ligar(grupo, definir) {
      grupo.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('button[data-v]') : null;
        if (!b) return;
        definir(b.getAttribute('data-v'));
        [].forEach.call(grupo.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        filtrar();
      });
    }

    c.campo.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(filtrar, 150); });
    c.ord.addEventListener('change', filtrar);
    if (c.selPlat) c.selPlat.addEventListener('change', filtrar);
    ligar(c.grupoTipo, function (v) { tipoSel = v; });
    ligar(c.grupoGen, function (v) { genSel = v; });
    c.botao.addEventListener('click', function () { desenhar(false); });
    filtrar();
  }

  function carregar(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); });
  }

  // ---------- página de uma plataforma ----------
  var raiz = document.getElementById('catalogo');
  if (raiz) {
    var status = document.getElementById('c-status');
    carregar(raiz.getAttribute('data-json')).then(function (j) {
      motor({
        raiz: raiz, itens: j.i, nomes: j.g, plats: null,
        campo: document.getElementById('c-busca'), ord: document.getElementById('c-ord'), selPlat: null,
        grupoTipo: document.getElementById('c-tipo'), grupoGen: document.getElementById('c-gen'),
        status: status, botao: document.getElementById('c-mais'),
      });
    }).catch(function () { status.textContent = 'Não foi possível carregar o catálogo; mostrando os mais populares.'; });
  }

  // ---------- índice: todas as plataformas ----------
  var grade = document.getElementById('b-grade');
  if (grade) {
    var area = document.getElementById('b-area');
    var st = document.getElementById('b-status');
    var iniciado = false;
    var iniciar = function (alvo) {
      if (iniciado) return;
      iniciado = true;
      st.textContent = 'Carregando o catálogo completo…';
      carregar(grade.getAttribute('data-json')).then(function (j) {
        motor({
          raiz: grade, itens: j.i, nomes: j.g, plats: j.p,
          campo: document.getElementById('b-busca'), ord: document.getElementById('b-ord'), selPlat: document.getElementById('b-plat'),
          grupoTipo: document.getElementById('b-tipo'), grupoGen: document.getElementById('b-gen'),
          status: st, botao: document.getElementById('b-mais'),
        });
        // a interação que disparou o carregamento ainda precisa valer
        if (alvo && alvo.closest && alvo.closest('button[data-v]')) alvo.closest('button[data-v]').click();
      }).catch(function () { iniciado = false; st.textContent = 'Não foi possível carregar o catálogo completo. Tente de novo.'; });
    };
    ['focusin', 'click', 'input', 'change'].forEach(function (ev) {
      area.addEventListener(ev, function (e) { iniciar(e.target); }, { once: false });
    });
    // clicar em "Mostrar mais" também pede o catálogo completo
    document.getElementById('b-mais').addEventListener('click', function (e) { iniciar(null); });
  }
})();
