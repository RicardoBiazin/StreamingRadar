// Modal de detalhe: clicar no título ou no pôster de um filme/série abre elenco, direção,
// sinopse completa, onde assistir e links, sem sair da página. Fontes, em ordem:
// 1) /detalhe/<tipo>-<id>.json (estático, só para cartões de lançamento);
// 2) /api/detalhe?tipo=&id= (Netlify Function que consulta o TMDB).
// Sem JS, o clique segue o link normal para o TMDB.
(function () {
  var IMG = 'https://image.tmdb.org/t/p/';
  var cache = {};
  var dlg = null, corpo = null, anterior = null;

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null && txt !== '') e.textContent = txt;
    return e;
  }
  function link(href, txt) {
    var a = el('a', null, txt);
    a.href = href; a.rel = 'noopener';
    return a;
  }
  function dataBR(s) {
    if (!s) return '';
    var p = s.split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : s;
  }

  function montar() {
    if (dlg) return;
    dlg = document.createElement('dialog');
    dlg.className = 'detalhe';
    dlg.setAttribute('aria-label', 'Detalhes do título');
    var fechar = el('button', 'detalhe-fechar', '×');
    fechar.type = 'button'; fechar.setAttribute('aria-label', 'Fechar');
    fechar.addEventListener('click', function () { dlg.close(); });
    corpo = el('div', 'detalhe-corpo');
    dlg.appendChild(fechar); dlg.appendChild(corpo);
    // clique no fundo (fora do conteúdo) fecha
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { if (anterior && anterior.focus) anterior.focus(); });
    document.body.appendChild(dlg);
  }

  function obter(tipo, id, estatico) {
    var chave = tipo + '-' + id;
    if (cache[chave]) return Promise.resolve(cache[chave]);
    var api = function () {
      return fetch('/api/detalhe?tipo=' + tipo + '&id=' + id).then(function (r) {
        if (!r.ok) throw new Error('api ' + r.status);
        return r.json();
      });
    };
    var p = estatico
      ? fetch('/detalhe/' + chave + '.json').then(function (r) { if (!r.ok) throw new Error('estatico'); return r.json(); }).catch(api)
      : api();
    return p.then(function (d) { cache[chave] = d; return d; });
  }

  function chipsPlataforma(lista) {
    var box = el('div', 'onde');
    lista.forEach(function (p) {
      var c = el('span', 'chip');
      if (p.l) {
        var img = el('img'); img.src = IMG + 'w45' + p.l; img.alt = ''; img.width = 20; img.height = 20; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
        c.appendChild(img);
      }
      c.appendChild(el('span', null, p.n));
      box.appendChild(c);
    });
    return box;
  }

  function desenhar(d) {
    corpo.textContent = '';
    var topo = el('div', 'detalhe-topo');
    var hrefTmdb = 'https://www.themoviedb.org/' + d.tipo + '/' + d.id;

    var info = el('div', 'detalhe-info');
    var h = el('h2', null, d.t);
    var ano = d.d ? d.d.slice(0, 4) : '';
    if (ano) h.appendChild(el('span', 'detalhe-ano', ' (' + ano + ')'));
    info.appendChild(h);
    if (d.o && d.o !== d.t) info.appendChild(el('p', 'orig', d.o));
    if (d.l) info.appendChild(el('p', 'detalhe-slogan', '“' + d.l + '”'));

    var meta = [];
    meta.push(d.tipo === 'tv' ? 'Série' : 'Filme');
    if (d.d) meta.push(dataBR(d.d));
    if (d.r) meta.push(d.r + ' min' + (d.tipo === 'tv' ? ' por episódio' : ''));
    if (d.tipo === 'tv' && d.temp) meta.push(d.temp + (d.temp === 1 ? ' temporada' : ' temporadas') + (d.eps ? ', ' + d.eps + ' episódios' : ''));
    if (d.g && d.g.length) meta.push(d.g.join(', '));
    if (d.pais && d.pais.length) meta.push(d.pais.join(' · '));
    info.appendChild(el('p', 'meta', meta.join(' · ')));
    if (d.st && d.tipo === 'tv') info.appendChild(el('p', 'meta', 'Situação: ' + d.st));

    if (d.n) {
      var nota = el('p', 'detalhe-nota', '★ ' + d.n.toFixed(1).replace('.', ','));
      nota.appendChild(el('span', null, ' nota TMDB, ' + d.v.toLocaleString('pt-BR') + ' votos'));
      info.appendChild(nota);
    }
    if (d.dir && d.dir.length) {
      var dir = el('p', 'detalhe-dir');
      dir.appendChild(el('b', null, d.tipo === 'tv' ? 'Criação: ' : 'Direção: '));
      dir.appendChild(document.createTextNode(d.dir.join(', ')));
      info.appendChild(dir);
    }
    topo.appendChild(info);
    corpo.appendChild(topo);

    corpo.appendChild(el('h3', 'detalhe-sec', 'Sinopse'));
    corpo.appendChild(el('p', 'detalhe-sinopse', d.s || 'Sinopse ainda não disponível em português.'));

    if (d.el && d.el.length) {
      corpo.appendChild(el('h3', 'detalhe-sec', 'Elenco'));
      var grade = el('ul', 'elenco');
      d.el.forEach(function (c) {
        var li = el('li');
        if (c.f) {
          var im = el('img', 'foto'); im.src = IMG + 'w185' + c.f; im.alt = c.n; im.width = 92; im.height = 138; im.loading = 'lazy'; im.referrerPolicy = 'no-referrer';
          li.appendChild(im);
        } else {
          var sf = el('div', 'foto sem', c.n.slice(0, 1)); sf.setAttribute('aria-hidden', 'true');
          li.appendChild(sf);
        }
        li.appendChild(el('strong', null, c.n));
        if (c.p) li.appendChild(el('span', null, c.p));
        grade.appendChild(li);
      });
      corpo.appendChild(grade);
    }

    var pl = d.pl || {};
    var grupos = [['Assinatura ou grátis', pl.assinatura], ['Aluguel', pl.aluguel], ['Compra', pl.compra]];
    var algum = grupos.some(function (g) { return g[1] && g[1].length; });
    corpo.appendChild(el('h3', 'detalhe-sec', 'Onde assistir no Brasil'));
    if (algum) {
      grupos.forEach(function (g) {
        if (!g[1] || !g[1].length) return;
        var linha = el('div', 'detalhe-onde');
        linha.appendChild(el('span', 'rot', g[0]));
        linha.appendChild(chipsPlataforma(g[1]));
        corpo.appendChild(linha);
      });
    } else {
      corpo.appendChild(el('p', 'vazio', 'Nenhuma plataforma informada para o Brasil.'));
    }

    var links = el('p', 'links detalhe-links');
    var partes = [link(hrefTmdb, 'TMDB')];
    if (d.imdb) partes.push(link('https://www.imdb.com/title/' + d.imdb + '/', 'IMDb'));
    if (d.tr) partes.push(link('https://www.youtube.com/watch?v=' + d.tr, 'Trailer'));
    if (d.jw) partes.push(link(d.jw, 'JustWatch'));
    else partes.push(link('https://www.justwatch.com/br/busca?q=' + encodeURIComponent(d.t), 'JustWatch'));
    partes.forEach(function (a, i) { if (i) links.appendChild(document.createTextNode(' · ')); links.appendChild(a); });
    corpo.appendChild(links);
  }

  function abrir(tipo, id, estatico, origem) {
    montar();
    anterior = origem;
    corpo.textContent = '';
    corpo.appendChild(el('p', 'detalhe-carregando', 'Carregando…'));
    if (!dlg.open) dlg.showModal();
    obter(tipo, id, estatico).then(desenhar).catch(function () {
      corpo.textContent = '';
      corpo.appendChild(el('p', 'vazio', 'Não foi possível carregar os detalhes agora. '));
      corpo.lastChild.appendChild(link('https://www.themoviedb.org/' + tipo + '/' + id, 'Abrir no TMDB'));
    });
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var alvo = e.target.closest ? e.target.closest('.card .capa, .card h3 a, .mini .capa, .mini h3 a') : null;
    if (!alvo || typeof HTMLDialogElement === 'undefined') return;
    var cartao = alvo.closest('.card, .mini');
    var tipo = cartao && cartao.getAttribute('data-tipo'), id = cartao && cartao.getAttribute('data-id');
    if (!tipo || !id) return;
    e.preventDefault();
    abrir(tipo, id, cartao.getAttribute('data-det') === '1', alvo);
  });
})();
