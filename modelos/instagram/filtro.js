// Modelo "instagram": abas, filtro por plataforma/gênero, grade/feed e abrir publicação.
// Sem este arquivo a página mostra tudo em feed.
(function () {
  'use strict';
  var doc = document;
  var root = doc.documentElement;
  root.classList.add('js');

  function ready(fn) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', fn); else fn();
  }

  function all(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function has(str, w) { return (' ' + str + ' ').indexOf(' ' + w + ' ') !== -1; }
  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sem armazenamento */ } }
  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  ready(function () {
    var paineis = all('.painel');
    var abas = all('.abas a[data-painel]');
    var posts = all('.post');
    var stories = all('.story[data-plat]');
    var gens = all('.gen');
    var secPaineis = doc.querySelector('.paineis');
    var estado = doc.querySelector('.estado');
    var barra = doc.querySelector('.barra-vista');
    var generos = doc.querySelector('.generos');
    var botoesVista = all('.vista');
    var filtro = { plat: '', gen: '' };
    var ativo = 'cinema';

    barra.hidden = false;
    generos.hidden = false;
    stories.forEach(function (s) { s.setAttribute('role', 'button'); });

    // ---- abas ----
    function mostrar(chave, rolar) {
      ativo = chave;
      paineis.forEach(function (p) { p.hidden = p.getAttribute('data-painel') !== chave; });
      abas.forEach(function (a) {
        var on = a.getAttribute('data-painel') === chave;
        a.classList.toggle('ativa', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      fecharTodos();
      if (rolar) {
        var topo = doc.querySelector('.abas-faixa').getBoundingClientRect().top + window.pageYOffset - 60;
        if (window.pageYOffset > topo) window.scrollTo(0, topo);
      }
    }
    abas.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var k = a.getAttribute('data-painel');
        mostrar(k, true);
        if (window.history && history.replaceState) history.replaceState(null, '', '#' + k);
      });
    });

    // ---- filtro ----
    function aplicar() {
      var cont = { cinema: 0, filmes: 0, series: 0 };
      posts.forEach(function (p) {
        var ok = (!filtro.plat || has(p.getAttribute('data-plat') || '', filtro.plat)) &&
                 (!filtro.gen || has(p.getAttribute('data-gen') || '', filtro.gen));
        p.hidden = !ok;
        if (!ok) fecharPost(p);
        if (ok) {
          var t = p.getAttribute('data-tipo');
          cont[t === 'cinema' ? 'cinema' : t === 'serie' ? 'series' : 'filmes']++;
        }
      });
      Object.keys(cont).forEach(function (k) {
        var n = doc.querySelector('[data-n="' + k + '"]');
        if (n) n.textContent = cont[k];
        var pn = doc.querySelector('#' + k);
        pn.querySelector('.qtd').textContent = cont[k];
        pn.querySelector('.vazio').hidden = cont[k] !== 0;
      });
      if (cont[ativo] === 0) {
        var alvo = ['cinema', 'filmes', 'series'].filter(function (k) { return cont[k] > 0; })[0];
        if (alvo) mostrar(alvo, false);
      }
      stories.forEach(function (s) {
        var on = (s.getAttribute('data-plat') || '') === filtro.plat;
        s.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      gens.forEach(function (g) { g.setAttribute('aria-pressed', g.getAttribute('data-gen') === filtro.gen ? 'true' : 'false'); });
      var partes = [];
      var sp = filtro.plat && doc.querySelector('.story[data-plat="' + filtro.plat + '"] .story-nome');
      var sg = filtro.gen && doc.querySelector('.gen[data-gen="' + filtro.gen + '"]');
      if (sp) partes.push(sp.textContent);
      if (sg) partes.push(sg.firstChild.textContent);
      var total = cont.cinema + cont.filmes + cont.series;
      estado.textContent = partes.length ? 'Filtro: ' + partes.join(' + ') + ' · ' + total + ' de ' + posts.length : posts.length + ' lançamentos na semana';
    }
    stories.forEach(function (s) {
      s.addEventListener('click', function (e) {
        e.preventDefault();
        var v = s.getAttribute('data-plat') || '';
        filtro.plat = (v && filtro.plat === v) ? '' : v;
        if (!v) filtro.gen = '';
        aplicar();
      });
    });
    gens.forEach(function (g) {
      g.addEventListener('click', function () {
        var v = g.getAttribute('data-gen');
        filtro.gen = filtro.gen === v ? '' : v;
        aplicar();
      });
    });

    // ---- grade / feed ----
    function vista(v) {
      secPaineis.classList.toggle('vista-grade', v === 'grade');
      botoesVista.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-vista') === v ? 'true' : 'false'); });
      if (v !== 'grade') fecharTodos();
      guardar('sr-instagram-vista', v);
    }
    botoesVista.forEach(function (b) { b.addEventListener('click', function () { vista(b.getAttribute('data-vista')); }); });

    // ---- abrir publicação na grade ----
    function fecharPost(p) {
      p.classList.remove('aberto');
      var b = p.querySelector('.abrir');
      if (b) b.setAttribute('aria-expanded', 'false');
    }
    function fecharTodos() { posts.forEach(fecharPost); }
    posts.forEach(function (p) {
      var fig = p.querySelector('.midia');
      var titulo = p.querySelector('.post-titulo').textContent;
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'abrir';
      b.setAttribute('aria-expanded', 'false');
      b.setAttribute('aria-label', titulo + ': abrir detalhes');
      fig.appendChild(b);
      b.addEventListener('click', function () {
        var abrir = !p.classList.contains('aberto');
        fecharTodos();
        if (abrir) {
          p.classList.add('aberto');
          b.setAttribute('aria-expanded', 'true');
          b.setAttribute('aria-label', titulo + ': fechar detalhes');
          p.scrollIntoView({ block: 'start', behavior: 'smooth' });
        } else {
          b.setAttribute('aria-label', titulo + ': abrir detalhes');
          b.focus();
        }
      });
      p.querySelector('.fechar').addEventListener('click', function () {
        fecharPost(p);
        b.setAttribute('aria-label', titulo + ': abrir detalhes');
        b.focus();
      });
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') fecharTodos();
    });

    // ---- semanas: o atalho "Semanas" da barra abre a lista ----
    function abrirSemanas() {
      if (location.hash === '#semanas') { var d = doc.getElementById('semanas'); if (d) d.open = true; }
    }
    window.addEventListener('hashchange', abrirSemanas);
    abrirSemanas();

    // ---- início ----
    var h = location.hash.replace('#', '');
    var inicial = (h === 'filmes' || h === 'series' || h === 'cinema') ? h : 'cinema';
    mostrar(inicial, false);
    vista(ler('sr-instagram-vista') === 'feed' ? 'feed' : 'grade');
    aplicar();
  });
})();
