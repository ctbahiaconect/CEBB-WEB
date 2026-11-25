/* ============================================================
   Colégio Estadual Barros Barreto — Aplicação do site público
   Roteamento por hash (#/pagina) e renderização a partir do Store
   ============================================================ */
(function () {
  'use strict';
  var esc = UI.esc, app = document.getElementById('app'), D, calMes = new Date();
  calMes.setDate(1);

  /* ---------- tema e dados ---------- */
  function aplicarTema() {
    var c = D.settings.cores, r = document.documentElement.style;
    r.setProperty('--azul', c.azul); r.setProperty('--marinho', c.marinho); r.setProperty('--vermelho', c.vermelho);
    r.setProperty('--amarelo', c.amarelo); r.setProperty('--verde', c.verde); r.setProperty('--papel', c.papel);
    var tc = document.querySelector('meta[name=theme-color]'); if (tc) tc.setAttribute('content', c.marinho);
  }
  function secaoOn(k) { return D.settings.secoes[k] !== false; }

  /* ---------- componentes fixos ---------- */
  function renderAviso() {
    var el = document.getElementById('aviso-topo'), s = D.settings;
    if (!s.mostrarAviso || !s.avisoTopo || sessionStorage.getItem('bb_aviso_off') === s.avisoTopo) { el.innerHTML = ''; return; }
    el.innerHTML = '<div class="aviso-topo"><div class="container"><i class="dot"></i><span>' + esc(s.avisoTopo) + '</span><button aria-label="Fechar aviso" id="fecha-aviso">×</button></div></div>';
    document.getElementById('fecha-aviso').onclick = function () { sessionStorage.setItem('bb_aviso_off', s.avisoTopo); el.innerHTML = ''; };
  }
  function logoHTML() {
    var s = D.settings;
    return '<span class="brand-mark">' + (s.logo ? '<img src="' + esc(s.logo) + '" alt="">' : '<span>' + esc((s.sigla || 'BB').slice(0, 3)) + '</span>') + '</span>';
  }
  var NAV = [
    ['#/', 'Início', null], ['#/sobre', 'A escola', null], ['#/ensino', 'Ensino', null], ['#/noticias', 'Notícias', 'noticias'],
    ['#/agenda', 'Agenda', 'agenda'], ['#/galeria', 'Galeria', 'galeria'], ['#/jogos', 'Jogos', 'jogos'], ['#/contato', 'Contato', null]
  ];
  function renderHeader() {
    var s = D.settings;
    document.title = s.nome;
    document.getElementById('header').innerHTML = '<div class="container"><a class="brand" href="#/" aria-label="' + esc(s.nome) + ' — página inicial">' + logoHTML() +
      '<span class="brand-text"><strong>' + esc(s.nome) + '</strong><small>Rede Estadual · Bahia</small></span></a>' +
      '<nav class="nav" id="nav" aria-label="Principal">' + NAV.filter(function (n) { return !n[2] || secaoOn(n[2]); }).map(function (n) { return '<a href="' + n[0] + '" data-rota="' + n[0] + '">' + n[1] + '</a>'; }).join('') +
      (secaoOn('salas') ? '<a class="destaque" href="#/salas" data-rota="#/salas">🎓 Salas virtuais</a>' : '') + '</nav>' +
      '<button class="menu-btn" id="menu-btn" aria-expanded="false" aria-controls="nav" aria-label="Abrir menu"><i></i></button></div>';
    var nav = document.getElementById('nav'), btn = document.getElementById('menu-btn');
    function toggle(o) { var v = typeof o === 'boolean' ? o : !nav.classList.contains('aberto'); nav.classList.toggle('aberto', v); btn.setAttribute('aria-expanded', v); }
    btn.onclick = function () { toggle(); };
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) toggle(false); });
    window.__menu = toggle;
  }
  function renderBottom() {
    var it = [['#/', '🏠', 'Início'], ['#/noticias', '📰', 'Notícias'], ['#/jogos', '🎮', 'Jogos'], ['#/salas', '🎓', 'Salas']].filter(function (i) {
      return (i[0] !== '#/noticias' || secaoOn('noticias')) && (i[0] !== '#/jogos' || secaoOn('jogos')) && (i[0] !== '#/salas' || secaoOn('salas'));
    });
    var b = document.getElementById('bottom-bar');
    b.innerHTML = it.map(function (i) { return '<a href="' + i[0] + '" data-rota="' + i[0] + '"><span>' + i[1] + '</span>' + i[2] + '</a>'; }).join('') + '<a href="#" id="bb-menu"><span>☰</span>Menu</a>';
    document.getElementById('bb-menu').onclick = function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); window.__menu(); };
  }
  function renderFooter() {
    var s = D.settings, soc = [['instagram', 'IG'], ['facebook', 'FB'], ['youtube', 'YT']].filter(function (x) { return s[x[0]]; });
    document.getElementById('footer').innerHTML = '<div class="container"><div class="rodape-grid"><div><a class="brand" href="#/" style="color:#fff">' + logoHTML() + '<span class="brand-text"><strong style="color:#fff;white-space:normal">' + esc(s.nome) + '</strong></span></a><p style="margin-top:1rem">' + esc(s.slogan) + '</p>' +
      '<div class="social">' + soc.map(function (x) { return '<a href="' + esc(s[x[0]]) + '" target="_blank" rel="noopener" aria-label="' + x[0] + '">' + x[1] + '</a>'; }).join('') + (s.whatsapp ? '<a href="https://wa.me/' + esc(s.whatsapp) + '" target="_blank" rel="noopener" aria-label="WhatsApp">WA</a>' : '') + '</div></div>' +
      '<div><h4>A escola</h4><a href="#/sobre">Sobre nós</a><a href="#/ensino">Ensino</a>' + (secaoOn('noticias') ? '<a href="#/noticias">Notícias</a>' : '') + (secaoOn('galeria') ? '<a href="#/galeria">Galeria</a>' : '') + '</div>' +
      '<div><h4>Para estudantes</h4>' + (secaoOn('salas') ? '<a href="#/salas">Salas virtuais</a>' : '') + (secaoOn('jogos') ? '<a href="#/jogos">Jogos didáticos</a>' : '') + (secaoOn('agenda') ? '<a href="#/agenda">Agenda escolar</a>' : '') + '<a href="#/contato">Fale conosco</a></div>' +
      '<div><h4>Contato</h4><p style="margin:0">📍 ' + esc(s.endereco) + '</p><p style="margin:.4rem 0 0">📞 ' + esc(s.telefone) + '</p><p style="margin:.4rem 0 0">✉️ ' + esc(s.email) + '</p><p style="margin:.4rem 0 0">🕒 ' + esc(s.horario) + '</p></div></div>' +
      '<div class="copy"><span>© ' + new Date().getFullYear() + ' ' + esc(s.nome) + ' · Rede Estadual de Ensino da Bahia</span><a href="admin/index.html" style="display:inline;opacity:.7">Área administrativa</a></div></div>';
  }

  /* ---------- helpers de página ---------- */
  function topo(titulo, sub, crumb) {
    return '<section class="pagina-topo"><div class="container"><div class="migalhas"><a href="#/">Início</a> / ' + esc(crumb || titulo) + '</div><h1>' + esc(titulo) + '</h1>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div></section>';
  }
  function secaoTopo(kicker, titulo, sub, link) {
    return '<div class="secao-topo reveal"><div><span class="kicker">' + esc(kicker) + '</span><h2>' + titulo + '</h2>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div>' + (link ? '<a class="btn btn-ghost btn-sm" href="' + link[0] + '">' + link[1] + '</a>' : '') + '</div>';
  }
  function cardNoticia(n, grande) {
    return '<a class="card noticia hover reveal' + (grande ? ' grande' : '') + '" href="#/noticia/' + esc(n.id) + '"><div class="capa">' + UI.imagemOuArte(n.img, n.id, n.titulo, '📰') + '<span class="chip">' + esc(n.categoria) + '</span></div>' +
      '<div class="corpo"><time datetime="' + esc(n.data) + '">' + UI.fmtData(n.data) + '</time><h3>' + esc(n.titulo) + '</h3><p>' + esc(n.resumo) + '</p></div></a>';
  }
  function cardCurso(c) {
    return '<article class="card curso hover reveal"><div class="ic">' + esc(c.icone) + '</div><small>' + esc(c.nivel) + '</small><h3>' + esc(c.titulo) + '</h3><p>' + esc(c.desc) + '</p><div class="turno">🕒 ' + esc(c.turnos) + '</div></article>';
  }
  function itemAgenda(a) {
    var d = UI.parseData(a.data); if (!d) return '';
    return '<div class="agenda-item reveal"><div class="data-bloco"><small>' + ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][d.getMonth()] + '</small><b>' + d.getDate() + '</b></div><div><h4>' + esc(a.titulo) + '</h4><span>🕒 ' + esc(a.hora) + ' · 📍 ' + esc(a.local) + '</span></div></div>';
  }
  function proximos(n) {
    var h = UI.hoje();
    return D.agenda.filter(function (a) { return a.data >= h; }).sort(function (a, b) { return a.data.localeCompare(b.data); }).slice(0, n);
  }
  function cardPessoa(p) {
    return '<div class="card pessoa hover reveal"><div class="avatar" style="background:' + UI.corDe(p.nome) + ';color:' + UI.corDe(p.nome) + '"><span style="color:#fff;position:relative;z-index:1">' + esc(UI.iniciais(p.nome)) + '</span></div><h3 style="margin-bottom:.1rem">' + esc(p.nome) + '</h3><small>' + esc(p.cargo) + '</small><p>' + esc(p.bio) + '</p></div>';
  }
  function cardDepo(d) {
    return '<blockquote class="card depo hover reveal" style="margin:0"><p>' + esc(d.texto) + '</p><footer><div class="avatar" style="background:' + UI.corDe(d.nome) + '"><span style="color:#fff">' + esc(UI.iniciais(d.nome)) + '</span></div><div><b>' + esc(d.nome) + '</b><small>' + esc(d.papel) + '</small></div></footer></blockquote>';
  }

  /* ---------- páginas ---------- */
  var P = {};

  P.home = function () {
    var h = D.hero, s = D.settings;
    var palavras = h.titulo.split(' ').map(function (w, i) { return '<span class="palavra" style="animation-delay:' + (0.15 + i * 0.07) + 's">' + esc(w) + '</span>'; }).join(' ');
    var noticias = D.noticias.slice().sort(function (a, b) { return b.data.localeCompare(a.data); });
    var dest = noticias.filter(function (n) { return n.destaque; })[0] || noticias[0], outras = noticias.filter(function (n) { return n !== dest; }).slice(0, 4);
    var tick = proximos(5).map(function (a) { return '<span>' + esc(a.titulo) + ' — ' + UI.parseData(a.data).getDate() + '/' + (UI.parseData(a.data).getMonth() + 1) + '</span>'; }).concat(noticias.slice(0, 3).map(function (n) { return '<span>' + esc(n.titulo) + '</span>'; }));
    var tk = tick.length ? tick.join('') : '<span>' + esc(s.slogan) + '</span>';
    var html = '<section class="hero"><div class="container hero-grid"><div><span class="hero-badge"><i></i> Ano letivo ' + esc(s.anoLetivo) + '</span><h1>' + palavras + '</h1><p class="sub">' + esc(h.subtitulo) + '</p>' +
      '<div class="hero-cta">' + (secaoOn('salas') ? '<a class="btn btn-amarelo" href="' + esc(h.cta1Link) + '">' + esc(h.cta1Texto) + '</a>' : '') + '<a class="btn btn-branco" href="' + esc(h.cta2Link) + '">' + esc(h.cta2Texto) + '</a></div></div>' +
      '<div class="hero-arte" aria-hidden="true"><span class="estrela e1">✦</span><span class="estrela e2">✦</span><span class="estrela e3">✦</span>' +
      '<div class="fitas"><div class="fita"><span>Fé</span></div><div class="fita"><span>Saber</span></div><div class="fita"><span>Bahia</span></div><div class="fita"><span>Futuro</span></div><div class="fita"><span>União</span></div></div>' +
      '<div class="hero-nuvem"><div class="ic">🎓</div><div><b>Sala virtual aberta</b><small>Aulas, atividades e chat da turma</small></div></div></div></div></section>' +
      '<div class="ticker" aria-label="Destaques"><div class="ticker-track">' + tk + tk + tk + tk + '</div></div>' +
      '<section class="container"><div class="stats reveal">' + h.stats.map(function (st) { return '<div class="stat"><b data-conta="' + (+st.n || 0) + '">0</b><span>' + esc(st.label) + '</span></div>'; }).join('') + '</div></section>' +
      '<section class="secao"><div class="container">' + secaoTopo('Acesso rápido', 'O que você quer fazer hoje?') + '<div class="grid g4">' +
      (secaoOn('salas') ? '<a class="card rapido r-azul hover reveal" href="#/salas"><span class="emoji">🎓</span><h3>Salas virtuais</h3><p>Aulas ao vivo, mural e atividades.</p></a>' : '') +
      (secaoOn('jogos') ? '<a class="card rapido r-vermelho hover reveal" href="#/jogos"><span class="emoji">🎮</span><h3>Jogos didáticos</h3><p>Aprenda brincando e suba no ranking.</p></a>' : '') +
      (secaoOn('agenda') ? '<a class="card rapido r-verde hover reveal" href="#/agenda"><span class="emoji">📅</span><h3>Agenda escolar</h3><p>Provas, reuniões e eventos.</p></a>' : '') +
      '<a class="card rapido r-amarelo hover reveal" href="#/contato"><span class="emoji">💬</span><h3>Secretaria</h3><p>Matrículas, documentos e dúvidas.</p></a></div></div></section>' +
      '<section class="secao branca"><div class="container"><div class="grid g2" style="align-items:center;gap:3rem"><div class="reveal"><span class="kicker">Nossa escola</span><h2>Uma escola pública com a cara da Bahia</h2><div class="texto-longo">' + UI.paragrafos(D.sobre.historia.split(/\n{2,}/)[0]) + '</div><a class="btn btn-primario" href="#/sobre">Conheça nossa história</a></div>' +
      '<div class="grid g2 reveal"><div class="card hover"><h3>🎯 Missão</h3><p style="margin:0;color:var(--suave)">' + esc(D.sobre.missao) + '</p></div><div class="card hover"><h3>🔭 Visão</h3><p style="margin:0;color:var(--suave)">' + esc(D.sobre.visao) + '</p></div></div></div></div></section>' +
      (secaoOn('noticias') && dest ? '<section class="secao"><div class="container">' + secaoTopo('Notícias', 'Acontece no Barros Barreto', 'Novidades, projetos e conquistas da comunidade escolar.', ['#/noticias', 'Ver todas']) + '<div class="grid g3">' + cardNoticia(dest, true) + (outras[0] ? cardNoticia(outras[0]) : '') + '</div>' + (outras.length > 1 ? '<div class="grid g3" style="margin-top:1.4rem">' + outras.slice(1, 4).map(function (n) { return cardNoticia(n); }).join('') + '</div>' : '') + '</div></section>' : '') +
      '<section class="secao branca"><div class="container">' + secaoTopo('Ensino', 'Caminhos para aprender e crescer', null, ['#/ensino', 'Ver tudo']) + '<div class="grid g3">' + D.cursos.slice(0, 6).map(cardCurso).join('') + '</div></div></section>' +
      (secaoOn('jogos') ? '<section class="secao marinho azulejo-escuro"><div class="container">' + secaoTopo('Jogos didáticos', 'Estudar pode ser divertido', 'Cinco jogos para revisar conteúdos, treinar a mente e disputar o ranking da escola.', ['#/jogos', 'Ver todos os jogos']) + '<div class="jogos-grid">' + Games.lista.slice(0, 4).map(function (j) { return '<a class="jogo-card ' + j.cls + ' reveal" href="#/jogos/' + j.id + '" style="text-decoration:none"><span class="emoji">' + j.emoji + '</span><span class="tag">' + esc(j.tag) + '</span><h3>' + esc(j.nome) + '</h3><p>' + esc(j.desc) + '</p></a>'; }).join('') + '</div></div></section>' : '') +
      (secaoOn('agenda') && proximos(1).length ? '<section class="secao"><div class="container">' + secaoTopo('Agenda', 'Próximos compromissos', null, ['#/agenda', 'Ver calendário']) + '<div class="grid g2">' + proximos(4).map(itemAgenda).join('') + '</div></div></section>' : '') +
      (secaoOn('depoimentos') && D.depoimentos.length ? '<section class="secao branca"><div class="container">' + secaoTopo('Comunidade', 'Quem vive a escola conta') + '<div class="grid g3">' + D.depoimentos.map(cardDepo).join('') + '</div></div></section>' : '') +
      '<section class="secao"><div class="container"><div class="cta reveal"><div><h2>Matrículas abertas para 2027</h2><p>Procure a secretaria com documento do estudante, comprovante de residência e histórico escolar.</p></div><a class="btn btn-amarelo" href="#/contato">Falar com a secretaria</a></div></div></section>';
    return html;
  };

  P.sobre = function () {
    var s = D.sobre;
    return topo('A escola', D.settings.slogan, 'A escola') +
      '<section class="secao"><div class="container"><div class="grid g2" style="gap:3rem;align-items:start"><div class="reveal"><span class="kicker">Nossa história</span><h2>Quem somos</h2><div class="texto-longo">' + UI.paragrafos(s.historia) + '</div></div>' +
      '<div class="grid mvv reveal"><div class="card hover"><h3><span class="ic">🎯</span>Missão</h3><p style="margin:0;color:var(--suave)">' + esc(s.missao) + '</p></div><div class="card hover"><h3><span class="ic">🔭</span>Visão</h3><p style="margin:0;color:var(--suave)">' + esc(s.visao) + '</p></div><div class="card hover"><h3><span class="ic">💛</span>Valores</h3><div class="valores">' + s.valores.map(function (v) { return '<span>' + esc(v) + '</span>'; }).join('') + '</div></div></div></div></div></section>' +
      (secaoOn('equipe') && D.equipe.length ? '<section class="secao branca"><div class="container">' + secaoTopo('Equipe', 'Quem cuida da escola') + '<div class="grid g4">' + D.equipe.map(cardPessoa).join('') + '</div></div></section>' : '');
  };

  P.ensino = function () {
    return topo('Ensino', 'Etapas, projetos e atividades que formam o dia a dia do Barros Barreto.') +
      '<section class="secao"><div class="container"><div class="grid g3">' + D.cursos.map(cardCurso).join('') + '</div></div></section>' +
      '<section class="secao"><div class="container"><div class="cta reveal"><div><h2>Quer conhecer a escola por dentro?</h2><p>Agende uma visita com a coordenação e tire todas as dúvidas.</p></div><a class="btn btn-amarelo" href="#/contato">Agendar visita</a></div></div></section>';
  };

  var filtroNoticia = { cat: '', q: '' };
  P.noticias = function () {
    if (!secaoOn('noticias')) return desligada();
    var cats = []; D.noticias.forEach(function (n) { if (cats.indexOf(n.categoria) < 0) cats.push(n.categoria); });
    return topo('Notícias', 'Fique por dentro do que acontece na escola.') +
      '<section class="secao"><div class="container"><div class="busca"><input class="input" id="n-q" type="search" placeholder="Buscar notícia" aria-label="Buscar notícia"></div><div class="filtros" id="n-cats"><button class="filtro ativo" data-c="">Todas</button>' +
      cats.map(function (c) { return '<button class="filtro" data-c="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div><div class="grid g3" id="n-lista"></div></div></section>';
  };
  function listarNoticias() {
    var l = document.getElementById('n-lista'); if (!l) return;
    var q = filtroNoticia.q.toLowerCase();
    var r = D.noticias.filter(function (n) { return (!filtroNoticia.cat || n.categoria === filtroNoticia.cat) && (!q || (n.titulo + ' ' + n.resumo).toLowerCase().indexOf(q) >= 0); }).sort(function (a, b) { return b.data.localeCompare(a.data); });
    l.innerHTML = r.length ? r.map(function (n) { return cardNoticia(n); }).join('') : '<div class="vazio" style="grid-column:1/-1"><div class="ic">🔍</div><p>Nenhuma notícia encontrada.</p></div>';
    UI.observar(l);
  }
  P.noticia = function (id) {
    var n = D.noticias.filter(function (x) { return x.id === id; })[0];
    if (!n) return topo('Notícia não encontrada', '', 'Notícias') + '<section class="secao"><div class="container vazio"><p>Esta notícia não existe mais.</p><a class="btn btn-primario" href="#/noticias">Ver notícias</a></div></section>';
    return '<section class="pagina-topo"><div class="container"><div class="migalhas"><a href="#/">Início</a> / <a href="#/noticias">Notícias</a></div><span class="chip" style="background:var(--amarelo);color:var(--marinho)">' + esc(n.categoria) + '</span><h1>' + esc(n.titulo) + '</h1><p>' + UI.fmtData(n.data) + '</p></div></section>' +
      '<section class="secao" style="padding-top:0"><div class="container"><article class="artigo"><div class="capa">' + UI.imagemOuArte(n.img, n.id, n.titulo, '📰') + '</div><div class="texto-longo" style="max-width:none">' + UI.paragrafos(n.texto) + '</div>' +
      '<div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1.5rem"><a class="btn btn-ghost btn-sm" href="#/noticias">← Todas as notícias</a><button class="btn btn-primario btn-sm" id="compartilhar">Compartilhar</button></div></article></div></section>';
  };

  P.agenda = function () {
    if (!secaoOn('agenda')) return desligada();
    return topo('Agenda escolar', 'Calendário de provas, reuniões, eventos e feriados escolares.') +
      '<section class="secao"><div class="container"><div class="grid g2" style="gap:2rem;align-items:start"><div class="calendario reveal" id="cal"></div><div><h3 class="reveal">Próximos compromissos</h3><div style="display:grid;gap:.8rem">' + (proximos(12).map(itemAgenda).join('') || '<div class="vazio"><div class="ic">🗓️</div><p>Sem eventos futuros cadastrados.</p></div>') + '</div></div></div></div></section>';
  };
  function desenharCal() {
    var el = document.getElementById('cal'); if (!el) return;
    var y = calMes.getFullYear(), m = calMes.getMonth(), prim = new Date(y, m, 1).getDay(), dias = new Date(y, m + 1, 0).getDate(), hoje = UI.hoje(), h = '';
    var mapa = {}; D.agenda.forEach(function (a) { (mapa[a.data] = mapa[a.data] || []).push(a); });
    ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach(function (d) { h += '<div class="dow">' + d + '</div>'; });
    for (var i = 0; i < prim; i++) h += '<div class="cal-dia fora"></div>';
    for (var d = 1; d <= dias; d++) {
      var iso = y + '-' + ('0' + (m + 1)).slice(-2) + '-' + ('0' + d).slice(-2), ev = mapa[iso];
      h += ev ? '<button class="cal-dia evento' + (iso === hoje ? ' hoje' : '') + '" data-d="' + iso + '" title="' + esc(ev.map(function (e) { return e.titulo; }).join(', ')) + '">' + d + '</button>' : '<div class="cal-dia' + (iso === hoje ? ' hoje' : '') + '">' + d + '</div>';
    }
    el.innerHTML = '<div class="cal-topo"><button id="cal-prev" aria-label="Mês anterior">‹</button><h3>' + UI.MESES[m] + ' ' + y + '</h3><button id="cal-next" aria-label="Próximo mês">›</button></div><div class="cal-grid">' + h + '</div>';
    el.querySelector('#cal-prev').onclick = function () { calMes.setMonth(calMes.getMonth() - 1); desenharCal(); };
    el.querySelector('#cal-next').onclick = function () { calMes.setMonth(calMes.getMonth() + 1); desenharCal(); };
    el.querySelectorAll('[data-d]').forEach(function (b) {
      b.onclick = function () {
        var iso = b.getAttribute('data-d');
        UI.modal('<h3>' + UI.fmtData(iso) + '</h3>' + mapa[iso].map(function (a) { return '<div class="agenda-item" style="margin-bottom:.6rem"><div class="data-bloco"><small>HORA</small><b style="font-size:1.1rem">' + esc(a.hora) + '</b></div><div><h4>' + esc(a.titulo) + '</h4><span>📍 ' + esc(a.local) + '</span></div></div>'; }).join(''));
      };
    });
  }

  var filtroGal = '';
  P.galeria = function () {
    if (!secaoOn('galeria')) return desligada();
    var cats = []; D.galeria.forEach(function (g) { if (g.cat && cats.indexOf(g.cat) < 0) cats.push(g.cat); });
    return topo('Galeria', 'Momentos que fazem parte da nossa história.') +
      '<section class="secao"><div class="container"><div class="filtros" id="g-cats"><button class="filtro ativo" data-c="">Todas</button>' + cats.map(function (c) { return '<button class="filtro" data-c="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div><div class="galeria" id="g-lista"></div></div></section>';
  };
  function listarGaleria() {
    var l = document.getElementById('g-lista'); if (!l) return;
    var r = D.galeria.filter(function (g) { return !filtroGal || g.cat === filtroGal; });
    l.innerHTML = r.map(function (g, i) {
      var ar = ['4/3', '1/1', '3/4', '16/10'][UI.hash(g.id) % 4];
      return '<button class="foto reveal" data-g="' + esc(g.id) + '" style="--ar:' + ar + '" aria-label="Ampliar: ' + esc(g.legenda) + '">' + (g.img ? '<img src="' + esc(g.img) + '" alt="' + esc(g.legenda) + '" loading="lazy">' : UI.arte(g.id, ['📸', '🎨', '⚽', '🎶', '🔬', '📚'][i % 6])) + '<span class="leg">' + esc(g.legenda) + '</span></button>';
    }).join('') || '<div class="vazio"><div class="ic">🖼️</div><p>Nenhuma foto nesta categoria.</p></div>';
    UI.observar(l);
    l.querySelectorAll('[data-g]').forEach(function (b) {
      b.onclick = function () {
        var g = D.galeria.filter(function (x) { return x.id === b.getAttribute('data-g'); })[0];
        UI.modal((g.img ? '<img src="' + esc(g.img) + '" alt="' + esc(g.legenda) + '">' : UI.arte(g.id, '📸')) + '<p style="color:#fff;text-align:center;margin:.8rem 0 .2rem;font-weight:700">' + esc(g.legenda) + '</p>', true);
      };
    });
  }

  P.jogos = function (sub) {
    if (!secaoOn('jogos')) return desligada();
    var at = D.jogos.ativos;
    if (sub) {
      var j = Games.lista.filter(function (x) { return x.id === sub; })[0];
      if (!j || at[sub] === false) return topo('Jogo indisponível', '', 'Jogos') + '<section class="secao"><div class="container vazio"><p>Este jogo não está disponível agora.</p><a class="btn btn-primario" href="#/jogos">Voltar aos jogos</a></div></section>';
      return '<section class="pagina-topo"><div class="container"><div class="migalhas"><a href="#/">Início</a> / <a href="#/jogos">Jogos</a> / ' + esc(j.nome) + '</div><h1>' + j.emoji + ' ' + esc(j.nome) + '</h1><p>' + esc(j.desc) + '</p></div></section>' +
        '<section class="secao" style="padding-top:0"><div class="container"><div class="palco" style="margin-top:-1.5rem;position:relative;z-index:4" id="palco"></div><div style="text-align:center;margin-top:1.4rem"><a class="btn btn-ghost btn-sm" href="#/jogos">← Outros jogos</a></div></div></section>';
    }
    return topo('Jogos didáticos', 'Aprenda brincando: revise conteúdos, treine a mente e dispute o ranking da escola.') +
      '<section class="secao"><div class="container"><div class="jogos-grid">' + Games.lista.map(function (j) {
        return '<a class="jogo-card ' + j.cls + ' reveal' + (at[j.id] === false ? ' desligado' : '') + '" href="#/jogos/' + j.id + '" style="text-decoration:none"><span class="emoji">' + j.emoji + '</span><span class="tag">' + esc(j.tag) + '</span><h3>' + esc(j.nome) + '</h3><p>' + esc(j.desc) + '</p></a>';
      }).join('') + '</div></div></section>';
  };

  P.salas = function (sub) {
    if (!secaoOn('salas')) return desligada();
    if (sub) return '<section class="secao" style="padding-top:2rem"><div class="container" id="sala-box"></div></section>';
    return topo('Salas de aula virtuais', 'Aulas ao vivo, mural de avisos, atividades, materiais e chat da turma.') + '<section class="secao"><div class="container" id="salas-box"></div></section>';
  };

  P.contato = function () {
    var s = D.settings;
    return topo('Contato', 'Fale com a secretaria, a coordenação ou a direção.') +
      '<section class="secao"><div class="container"><div class="grid g2" style="gap:2.5rem;align-items:start"><div class="card reveal"><h3>Envie uma mensagem</h3><form class="form" id="f-contato" novalidate>' +
      '<div class="campo"><label for="c-nome">Nome</label><input class="input" id="c-nome" required maxlength="80" autocomplete="name"></div>' +
      '<div class="campo"><label for="c-email">E-mail</label><input class="input" id="c-email" type="email" required maxlength="120" autocomplete="email"></div>' +
      '<div class="campo"><label for="c-assunto">Assunto</label><select class="select" id="c-assunto"><option>Matrícula</option><option>Documentos</option><option>Sugestão</option><option>Elogio</option><option>Reclamação</option><option>Outro</option></select></div>' +
      '<div class="campo"><label for="c-texto">Mensagem</label><textarea class="input" id="c-texto" rows="5" required maxlength="1500"></textarea></div>' +
      '<input type="text" id="c-site" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true"><button class="btn btn-primario" style="width:100%">Enviar mensagem</button></form></div>' +
      '<div class="reveal"><div class="contato-info">' +
      '<div class="linha"><div class="ic">📍</div><div><b>Endereço</b><br>' + esc(s.endereco) + '</div></div><div class="linha"><div class="ic">📞</div><div><b>Telefone</b><br>' + esc(s.telefone) + '</div></div>' +
      '<div class="linha"><div class="ic">✉️</div><div><b>E-mail</b><br>' + esc(s.email) + '</div></div><div class="linha"><div class="ic">🕒</div><div><b>Atendimento</b><br>' + esc(s.horario) + '</div></div></div>' +
      (s.whatsapp ? '<a class="btn btn-primario" style="margin:1.2rem 0;background:#1FA971" href="https://wa.me/' + esc(s.whatsapp) + '" target="_blank" rel="noopener">Chamar no WhatsApp</a>' : '') +
      (s.mapaEmbed ? '<iframe class="mapa" title="Mapa da escola" loading="lazy" src="' + esc(s.mapaEmbed) + '"></iframe>' : '') + '</div></div></div></section>';
  };
  function ligarContato() {
    var f = document.getElementById('f-contato'); if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (document.getElementById('c-site').value) return;
      var nome = f.querySelector('#c-nome').value.trim(), email = f.querySelector('#c-email').value.trim(), texto = f.querySelector('#c-texto').value.trim();
      if (!nome || !/^\S+@\S+\.\S+$/.test(email) || !texto) { UI.toast('Preencha nome, e-mail válido e mensagem.'); return; }
      var msg = { id: Store.uid('m'), nome: nome, email: email, assunto: f.querySelector('#c-assunto').value, texto: texto, data: new Date().toISOString(), lida: false };
      try { var l = JSON.parse(localStorage.getItem('bb_msgs_visitante')) || []; l.unshift(msg); localStorage.setItem('bb_msgs_visitante', JSON.stringify(l.slice(0, 200))); } catch (x) {}
      var s = D.settings, corpo = 'Nome: ' + nome + '\nE-mail: ' + email + '\nAssunto: ' + msg.assunto + '\n\n' + texto;
      f.reset(); UI.confete();
      UI.modal('<h3>Quase lá! Escolha como enviar</h3><p style="color:var(--suave)">Para a sua mensagem chegar até a escola, envie por um destes canais já preenchidos:</p>' +
        '<div style="display:grid;gap:.7rem"><a class="btn btn-primario" href="mailto:' + esc(s.email) + '?subject=' + encodeURIComponent('[Site] ' + msg.assunto) + '&body=' + encodeURIComponent(corpo) + '">✉️ Enviar por e-mail</a>' +
        (s.whatsapp ? '<a class="btn btn-primario" style="background:#1FA971" target="_blank" rel="noopener" href="https://wa.me/' + esc(s.whatsapp) + '?text=' + encodeURIComponent(corpo) + '">💬 Enviar pelo WhatsApp</a>' : '') + '<button class="btn btn-ghost" data-fechar>Fechar</button></div>');
    });
  }

  function desligada() { return topo('Página indisponível', '', 'Indisponível') + '<section class="secao"><div class="container vazio"><div class="ic">🚧</div><p>Esta seção está desativada no momento.</p><a class="btn btn-primario" href="#/">Voltar ao início</a></div></section>'; }

  /* ---------- roteador ---------- */
  function rota() {
    var h = (location.hash || '#/').replace(/^#\/?/, ''), partes = h.split('/'), nome = partes[0] || 'home', arg = partes[1], html;
    Games.parar(); Rooms.parar();
    if (!P[nome] || nome === 'home' && partes[0]) nome = 'home';
    html = P[nome](arg);
    app.innerHTML = '<div class="pg-in">' + html + '</div>';
    window.scrollTo(0, 0);
    document.querySelectorAll('[data-rota]').forEach(function (a) {
      var r = a.getAttribute('data-rota').replace('#/', ''), ativo = (nome === 'home' && r === '') || (r && (nome === r || (nome === 'noticia' && r === 'noticias')));
      a.classList.toggle('ativo', !!ativo);
    });
    /* ganchos pós-renderização */
    if (nome === 'noticias') {
      filtroNoticia = { cat: '', q: '' }; listarNoticias();
      app.querySelector('#n-q').addEventListener('input', function (e) { filtroNoticia.q = e.target.value; listarNoticias(); });
      app.querySelector('#n-cats').addEventListener('click', function (e) { var b = e.target.closest('.filtro'); if (!b) return; app.querySelectorAll('#n-cats .filtro').forEach(function (x) { x.classList.remove('ativo'); }); b.classList.add('ativo'); filtroNoticia.cat = b.getAttribute('data-c'); listarNoticias(); });
    }
    if (nome === 'noticia') { var cp = app.querySelector('#compartilhar'); if (cp) cp.onclick = function () { if (navigator.share) navigator.share({ title: document.title, url: location.href }).catch(function () {}); else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { UI.toast('Link copiado!'); }); }; }
    if (nome === 'agenda') desenharCal();
    if (nome === 'galeria') { filtroGal = ''; listarGaleria(); app.querySelector('#g-cats').addEventListener('click', function (e) { var b = e.target.closest('.filtro'); if (!b) return; app.querySelectorAll('#g-cats .filtro').forEach(function (x) { x.classList.remove('ativo'); }); b.classList.add('ativo'); filtroGal = b.getAttribute('data-c'); listarGaleria(); }); }
    if (nome === 'jogos' && arg && app.querySelector('#palco')) Games.iniciar(arg, app.querySelector('#palco'), D.jogos);
    if (nome === 'salas') { if (arg) Rooms.sala(app.querySelector('#sala-box'), D, arg); else if (app.querySelector('#salas-box')) Rooms.lista(app.querySelector('#salas-box'), D); }
    if (nome === 'contato') ligarContato();
    UI.observar(app);
    document.getElementById('nav') && window.__menu && window.__menu(false);
  }

  /* ---------- inicialização ---------- */
  function montar() {
    D = Store.get();
    aplicarTema(); renderAviso(); renderHeader(); renderBottom(); renderFooter(); rota();
  }
  window.addEventListener('hashchange', rota);
  window.addEventListener('storage', function (e) {
    if (e.key === Store.KEY) { Store.reload(); montar(); }
  });
  window.addEventListener('scroll', function () {
    var y = window.scrollY, h = document.getElementById('header'), v = document.getElementById('voltar-topo');
    h && h.classList.toggle('scrolled', y > 10); v && v.classList.toggle('on', y > 600);
  }, { passive: true });
  document.getElementById('voltar-topo').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.addEventListener('DOMContentLoaded', function () {});
  Store.carregarPublicado('assets/data/site-data.json').then(montar, montar);
  setTimeout(function () { var c = document.getElementById('carregando'); if (c) c.classList.add('fim'); }, 650);
})();
