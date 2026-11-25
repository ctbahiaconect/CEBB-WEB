/* ============================================================
   Painel administrativo — Colégio Estadual Barros Barreto
   Edita todo o conteúdo do site. Os dados são gravados no
   navegador (localStorage) e podem ser publicados exportando o
   arquivo site-data.json (menu "Backup e publicação").
   ============================================================ */
(function () {
  'use strict';
  var SESSAO = 'bb_admin_sessao', HASH_PADRAO = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
  var D, $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var contentEl = $('#conteudo'), sessao = null, falhas = 0, bloqueio = 0;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hoje() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function fmt(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : ''; }
  function getP(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function setP(o, p, v) { var ks = p.split('.'), l = ks.pop(); var t = ks.reduce(function (a, k) { return a[k]; }, o); t[l] = v; }
  function salvar(msg) { if (Store.save(D)) { toast(msg || 'Alterações salvas'); return true; } return false; }
  var tt;
  function toast(m, erro) { var t = $('#toast'); t.textContent = m; t.className = 'toast on' + (erro ? ' erro-t' : ''); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2600); }
  function modal(html) { var m = $('#modal'), b = $('#modal-box'); b.innerHTML = html; m.classList.add('aberto'); var f = $('input:not([type=hidden]):not([type=file]),textarea,select', b); if (f) setTimeout(function () { f.focus(); }, 50); return b; }
  function fechar() { $('#modal').classList.remove('aberto'); }
  $('#modal').addEventListener('click', function (e) { if (e.target.id === 'modal' || e.target.hasAttribute('data-fechar')) fechar(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });

  /* ======================= LOGIN ======================= */
  $('#f-login').addEventListener('submit', function (e) {
    e.preventDefault();
    var erro = $('#l-erro');
    if (Date.now() < bloqueio) { erro.textContent = 'Muitas tentativas. Aguarde ' + Math.ceil((bloqueio - Date.now()) / 1000) + ' s.'; return; }
    var user = $('#l-user').value.trim().toLowerCase(), pass = $('#l-pass').value;
    Store.sha256(pass).then(function (h) {
      var u = D.admins.filter(function (a) { return a.user.toLowerCase() === user && a.hash === h; })[0];
      if (!u) { falhas++; if (falhas >= 5) { bloqueio = Date.now() + 30000; falhas = 0; erro.textContent = 'Muitas tentativas. Aguarde 30 s.'; } else erro.textContent = 'Usuário ou senha incorretos.'; return; }
      falhas = 0; erro.textContent = '';
      sessao = { id: u.id, user: u.user, nome: u.nome };
      try { sessionStorage.setItem(SESSAO, JSON.stringify(sessao)); } catch (x) {}
      entrar();
    });
  });
  function entrar() {
    $('#login').hidden = true; $('#app').hidden = false;
    $('#user-lbl').textContent = '👤 ' + (sessao.nome || sessao.user);
    montarMenu(); rota();
  }
  $('#sair').addEventListener('click', function () { try { sessionStorage.removeItem(SESSAO); } catch (x) {} location.hash = ''; location.reload(); });

  /* ======================= MENU ======================= */
  var MENU = [
    ['Geral', [['painel', '📊', 'Painel'], ['config', '⚙️', 'Configurações'], ['aparencia', '🎨', 'Aparência e seções'], ['inicio', '🏠', 'Página inicial'], ['sobre', '🏫', 'A escola']]],
    ['Conteúdo', [['noticias', '📰', 'Notícias'], ['cursos', '📚', 'Ensino e projetos'], ['agenda', '📅', 'Agenda'], ['galeria', '🖼️', 'Galeria'], ['equipe', '👥', 'Equipe'], ['depoimentos', '💬', 'Depoimentos']]],
    ['Jogos didáticos', [['jogos', '🎮', 'Ativar jogos'], ['quiz', '🧠', 'Perguntas do quiz'], ['memoria', '🃏', 'Pares da memória'], ['forca', '🪢', 'Palavras da forca'], ['caca', '🔎', 'Caça-palavras']]],
    ['Salas virtuais', [['salas', '🎓', 'Salas'], ['salaAvisos', '📣', 'Avisos'], ['salaAtividades', '📝', 'Atividades'], ['salaMateriais', '📎', 'Materiais']]],
    ['Comunicação', [['mensagens', '✉️', 'Mensagens']]],
    ['Sistema', [['usuarios', '🔐', 'Usuários'], ['backup', '💾', 'Backup e publicação']]]
  ];
  var TITULOS = {};
  function montarMenu() {
    var novas = todasMensagens().filter(function (m) { return !m.lida; }).length;
    $('#menu').innerHTML = MENU.map(function (g) {
      return '<h4>' + g[0] + '</h4>' + g[1].map(function (i) { TITULOS[i[0]] = i[2]; return '<a href="#/' + i[0] + '" data-p="' + i[0] + '"><span>' + i[1] + '</span>' + i[2] + (i[0] === 'mensagens' && novas ? '<span class="badge">' + novas + '</span>' : '') + '</a>'; }).join('');
    }).join('');
  }
  function toggleMenu(v) { $('#side').classList.toggle('aberto', v); $('#scrim').classList.toggle('on', v); }
  $('#hamb').addEventListener('click', function () { toggleMenu(true); });
  $('#scrim').addEventListener('click', function () { toggleMenu(false); });
  $('#menu').addEventListener('click', function (e) { if (e.target.closest('a')) toggleMenu(false); });

  /* ======================= CAMPOS (motor de formulários) ======================= */
  var imgsTemp = {};
  function opcoesDe(f) { var o = typeof f.opts === 'function' ? f.opts() : f.opts || []; return o.map(function (x) { return Array.isArray(x) ? x : [x, x]; }); }
  function campoHTML(f, v) {
    var id = 'f_' + f.k.replace(/\W/g, '_'), h = '', rotulo = '<label for="' + id + '">' + esc(f.label) + (f.req ? ' *' : '') + '</label>';
    var hint = f.hint ? '<small>' + esc(f.hint) + '</small>' : '';
    switch (f.type) {
      case 'textarea': h = rotulo + '<textarea class="in" id="' + id + '" rows="' + (f.rows || 4) + '" ' + (f.req ? 'required' : '') + '>' + esc(v) + '</textarea>'; break;
      case 'lines': h = rotulo + '<textarea class="in" id="' + id + '" rows="' + (f.rows || 4) + '">' + esc((v || []).join('\n')) + '</textarea>'; break;
      case 'select': h = rotulo + '<select class="in" id="' + id + '">' + opcoesDe(f).map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(v) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; break;
      case 'checkbox': h = '<label class="check"><input type="checkbox" id="' + id + '"' + (v ? ' checked' : '') + '> ' + esc(f.label) + '</label>'; break;
      case 'switch': h = '<div class="item" style="display:flex;justify-content:space-between;gap:1rem;align-items:center"><label for="' + id + '" style="margin:0">' + esc(f.label) + '</label><span class="switch"><input type="checkbox" id="' + id + '"' + (v ? ' checked' : '') + '><i></i></span></div>'; break;
      case 'color': h = rotulo + '<div class="cor-linha"><input type="color" id="' + id + '" value="' + esc(v || '#000000') + '"><code data-cv="' + id + '">' + esc(v) + '</code></div>'; break;
      case 'image': imgsTemp[f.k] = v || '';
        h = rotulo + '<div class="upload"><div class="pv" data-pv="' + id + '" style="' + (v ? 'background-image:url(' + esc(v) + ')' : '') + '">' + (v ? '' : 'sem imagem') + '</div><div><input type="file" accept="image/*" id="' + id + '" data-img="' + f.k + '"> <button type="button" class="bt bt-ghost bt-sm" data-rm="' + f.k + '">Remover</button></div></div>'; break;
      default: h = rotulo + '<input class="in" id="' + id + '" type="' + (f.type || 'text') + '" value="' + esc(v) + '"' + (f.req ? ' required' : '') + (f.max ? ' maxlength="' + f.max + '"' : '') + (f.ph ? ' placeholder="' + esc(f.ph) + '"' : '') + (f.type === 'number' ? ' step="any"' : '') + '>';
    }
    return '<div class="campo">' + h + hint + '</div>';
  }
  function camposHTML(campos, obj) {
    var h = '', i = 0;
    while (i < campos.length) {
      var f = campos[i];
      if (f.meio && campos[i + 1] && campos[i + 1].meio) { h += '<div class="linha2">' + campoHTML(f, getP(obj, f.k)) + campoHTML(campos[i + 1], getP(obj, campos[i + 1].k)) + '</div>'; i += 2; }
      else { h += campoHTML(f, getP(obj, f.k)); i++; }
    }
    return h;
  }
  /* reduz e converte imagem para JPEG/PNG leve (evita encher o armazenamento) */
  function lerImagem(file, max, cb) {
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        var x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height);
        var png = /png|svg|gif/.test(file.type) && c.width * c.height < 160000;
        cb(c.toDataURL(png ? 'image/png' : 'image/jpeg', .82));
      };
      img.onerror = function () { toast('Não foi possível ler esta imagem.', true); };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  }
  function ligarCampos(raiz, campos) {
    $$('[data-img]', raiz).forEach(function (inp) {
      inp.addEventListener('change', function () {
        var f = inp.files[0]; if (!f) return; var k = inp.getAttribute('data-img'), cf = campos.filter(function (c) { return c.k === k; })[0] || {};
        lerImagem(f, cf.max || 1100, function (d) { imgsTemp[k] = d; var pv = $('[data-pv="' + inp.id + '"]', raiz); pv.style.backgroundImage = 'url(' + d + ')'; pv.textContent = ''; });
      });
    });
    $$('[data-rm]', raiz).forEach(function (b) { b.addEventListener('click', function () { var k = b.getAttribute('data-rm'); imgsTemp[k] = ''; var pv = b.closest('.upload').querySelector('.pv'); pv.style.backgroundImage = ''; pv.textContent = 'sem imagem'; }); });
    $$('input[type=color]', raiz).forEach(function (c) { c.addEventListener('input', function () { var o = $('[data-cv="' + c.id + '"]', raiz); if (o) o.textContent = c.value; }); });
  }
  /* lê os valores do formulário e valida; devolve null se inválido */
  function lerCampos(raiz, campos) {
    var out = {}, ok = true;
    campos.forEach(function (f) {
      var el = $('#f_' + f.k.replace(/\W/g, '_'), raiz), v;
      if (f.type === 'checkbox' || f.type === 'switch') v = el.checked;
      else if (f.type === 'image') v = imgsTemp[f.k] || '';
      else if (f.type === 'lines') v = el.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      else if (f.type === 'number') v = el.value === '' ? 0 : +el.value;
      else v = typeof el.value === 'string' ? el.value.trim() : el.value;
      if (f.req && (v === '' || (Array.isArray(v) && !v.length))) { ok = false; el.focus(); toast('Preencha o campo "' + f.label + '".', true); }
      out[f.k] = v;
    });
    return ok ? out : null;
  }

  /* ======================= CRUD GENÉRICO ======================= */
  var CRUD = {
    noticias: { path: 'noticias', titulo: 'Notícias', sing: 'notícia', ordem: true,
      cols: [['', function (i) { return i.img ? '<img class="thumb" src="' + esc(i.img) + '" alt="">' : '<div class="thumb"></div>'; }], ['Título', function (i) { return '<b>' + esc(i.titulo) + '</b>' + (i.destaque ? ' <span class="tag a">destaque</span>' : ''); }], ['Categoria', function (i) { return '<span class="tag">' + esc(i.categoria) + '</span>'; }], ['Data', function (i) { return fmt(i.data); }]],
      campos: [{ k: 'titulo', label: 'Título', req: true, max: 140 }, { k: 'categoria', label: 'Categoria', req: true, meio: true, ph: 'Ex.: Eventos' }, { k: 'data', label: 'Data', type: 'date', req: true, meio: true }, { k: 'resumo', label: 'Resumo (aparece nos cartões)', type: 'textarea', rows: 2, req: true }, { k: 'texto', label: 'Texto completo', type: 'textarea', rows: 8, hint: 'Separe os parágrafos com uma linha em branco.' }, { k: 'img', label: 'Imagem de capa', type: 'image' }, { k: 'destaque', label: 'Mostrar como destaque na página inicial', type: 'checkbox' }],
      novo: function () { return { data: hoje(), categoria: 'Avisos' }; } },
    cursos: { path: 'cursos', titulo: 'Ensino e projetos', sing: 'item', ordem: true,
      cols: [['', function (i) { return '<span style="font-size:1.6rem">' + esc(i.icone) + '</span>'; }], ['Título', function (i) { return '<b>' + esc(i.titulo) + '</b><br><span class="muted">' + esc(i.nivel) + '</span>'; }], ['Turnos', function (i) { return esc(i.turnos); }]],
      campos: [{ k: 'titulo', label: 'Título', req: true }, { k: 'icone', label: 'Ícone (emoji)', meio: true, req: true, max: 4 }, { k: 'nivel', label: 'Nível / séries', meio: true }, { k: 'turnos', label: 'Turnos', ph: 'Matutino e vespertino' }, { k: 'desc', label: 'Descrição', type: 'textarea', rows: 3 }],
      novo: function () { return { icone: '📘' }; } },
    agenda: { path: 'agenda', titulo: 'Agenda escolar', sing: 'evento',
      cols: [['Data', function (i) { return '<b>' + fmt(i.data) + '</b> ' + esc(i.hora); }], ['Evento', function (i) { return esc(i.titulo); }], ['Local', function (i) { return esc(i.local); }]],
      campos: [{ k: 'titulo', label: 'Título do evento', req: true }, { k: 'data', label: 'Data', type: 'date', req: true, meio: true }, { k: 'hora', label: 'Horário', type: 'time', meio: true }, { k: 'local', label: 'Local' }],
      novo: function () { return { data: hoje(), hora: '08:00' }; }, ordenar: function (a, b) { return a.data.localeCompare(b.data); } },
    galeria: { path: 'galeria', titulo: 'Galeria de fotos', sing: 'foto', ordem: true,
      cols: [['', function (i) { return i.img ? '<img class="thumb" src="' + esc(i.img) + '" alt="">' : '<div class="thumb"></div>'; }], ['Legenda', function (i) { return '<b>' + esc(i.legenda) + '</b>'; }], ['Categoria', function (i) { return '<span class="tag">' + esc(i.cat) + '</span>'; }]],
      campos: [{ k: 'legenda', label: 'Legenda', req: true }, { k: 'cat', label: 'Categoria', ph: 'Eventos, Cultura, Estrutura…' }, { k: 'img', label: 'Foto', type: 'image', hint: 'Sem foto, o site mostra uma ilustração colorida.' }],
      novo: function () { return { cat: 'Eventos' }; } },
    equipe: { path: 'equipe', titulo: 'Equipe', sing: 'pessoa', ordem: true,
      cols: [['Nome', function (i) { return '<b>' + esc(i.nome) + '</b>'; }], ['Cargo', function (i) { return esc(i.cargo); }], ['Área', function (i) { return '<span class="tag">' + esc(i.area) + '</span>'; }]],
      campos: [{ k: 'nome', label: 'Nome', req: true }, { k: 'cargo', label: 'Cargo', meio: true }, { k: 'area', label: 'Área', meio: true }, { k: 'bio', label: 'Descrição curta', type: 'textarea', rows: 2 }],
      novo: function () { return {}; } },
    depoimentos: { path: 'depoimentos', titulo: 'Depoimentos', sing: 'depoimento', ordem: true,
      cols: [['Nome', function (i) { return '<b>' + esc(i.nome) + '</b><br><span class="muted">' + esc(i.papel) + '</span>'; }], ['Texto', function (i) { return esc(i.texto.slice(0, 90)) + (i.texto.length > 90 ? '…' : ''); }]],
      campos: [{ k: 'nome', label: 'Nome', req: true, meio: true }, { k: 'papel', label: 'Quem é', meio: true, ph: 'Estudante do 3º ano' }, { k: 'texto', label: 'Depoimento', type: 'textarea', req: true }],
      novo: function () { return {}; } },
    quiz: { path: 'jogos.quiz', titulo: 'Perguntas do quiz', sing: 'pergunta',
      cols: [['Disciplina', function (i) { return '<span class="tag">' + esc(i.disc) + '</span>'; }], ['Pergunta', function (i) { return esc(i.pergunta); }], ['Correta', function (i) { return '<span class="tag v">' + esc((i.opcoes || [])[i.correta] || '?') + '</span>'; }]],
      campos: [{ k: 'disc', label: 'Disciplina', req: true, ph: 'Matemática' }, { k: 'pergunta', label: 'Pergunta', type: 'textarea', rows: 2, req: true }, { k: 'opcoes', label: 'Alternativas (uma por linha, de 2 a 4)', type: 'lines', rows: 4, req: true }, { k: 'correta', label: 'Número da alternativa correta (1 = primeira linha)', type: 'number', req: true, hint: 'Ex.: se a resposta certa é a segunda linha, digite 2.' }],
      novo: function () { return { opcoes: [], correta: 1 }; },
      entrada: function (i) { var c = Object.assign({}, i); c.correta = (+i.correta || 0) + 1; return c; },
      validar: function (v) { if (v.opcoes.length < 2 || v.opcoes.length > 4) return 'Informe de 2 a 4 alternativas.'; if (v.correta < 1 || v.correta > v.opcoes.length) return 'A alternativa correta deve estar entre 1 e ' + v.opcoes.length + '.'; v.correta = v.correta - 1; } },
    memoria: { path: 'jogos.memoria', titulo: 'Pares do jogo da memória', sing: 'par',
      cols: [['Carta A', function (i) { return '<b>' + esc(i.a) + '</b>'; }], ['Carta B (par)', function (i) { return esc(i.b); }]],
      campos: [{ k: 'a', label: 'Carta A', req: true, meio: true, max: 40 }, { k: 'b', label: 'Carta B (par correspondente)', req: true, meio: true, max: 40 }],
      novo: function () { return {}; } },
    forca: { path: 'jogos.forca', titulo: 'Palavras da forca', sing: 'palavra',
      cols: [['Palavra', function (i) { return '<b>' + esc(i.palavra) + '</b>'; }], ['Dica', function (i) { return esc(i.dica); }], ['Disciplina', function (i) { return '<span class="tag">' + esc(i.disc) + '</span>'; }]],
      campos: [{ k: 'palavra', label: 'Palavra', req: true, max: 20, hint: 'Sem espaços. Acentos são ignorados no jogo.' }, { k: 'disc', label: 'Disciplina', meio: true }, { k: 'dica', label: 'Dica', req: true, meio: true }],
      novo: function () { return {}; } },
    caca: { path: 'jogos.caca', titulo: 'Temas do caça-palavras', sing: 'tema',
      cols: [['Tema', function (i) { return '<b>' + esc(i.tema) + '</b>'; }], ['Palavras', function (i) { return esc((i.palavras || []).join(', ')); }]],
      campos: [{ k: 'tema', label: 'Tema', req: true }, { k: 'palavras', label: 'Palavras (uma por linha, até 10)', type: 'lines', rows: 8, req: true, hint: 'Use palavras de 3 a 12 letras, sem espaços.' }],
      novo: function () { return { palavras: [] }; },
      validar: function (v) { v.palavras = v.palavras.slice(0, 10); } },
    salas: { path: 'salas', titulo: 'Salas virtuais', sing: 'sala',
      cols: [['Sala', function (i) { return '<b>' + esc(i.nome) + '</b><br><span class="muted">' + esc(i.professor) + '</span>'; }], ['Horário', function (i) { return esc(i.dia) + ' · ' + esc(i.horario); }], ['Código', function (i) { return '<code>' + esc(i.codigo) + '</code>'; }]],
      campos: [{ k: 'nome', label: 'Nome da sala', req: true }, { k: 'turma', label: 'Turma', meio: true }, { k: 'disciplina', label: 'Disciplina', meio: true }, { k: 'professor', label: 'Professor(a)', meio: true }, { k: 'codigo', label: 'Código de acesso', meio: true, req: true, max: 12 }, { k: 'dia', label: 'Dias', meio: true, ph: 'Seg e Qua' }, { k: 'horario', label: 'Horário', type: 'time', meio: true }, { k: 'descricao', label: 'Descrição', type: 'textarea', rows: 2 }, { k: 'link', label: 'Link externo da aula (opcional)', type: 'url', ph: 'https://meet.google.com/...', hint: 'Se preenchido, aparece um botão extra na sala. A videoaula embutida funciona sem este link.' }, { k: 'cor', label: 'Cor da sala', type: 'color' }],
      novo: function () { return { cor: '#1747B8', horario: '08:00' }; },
      depoisRemover: function (it) { ['salaAvisos', 'salaAtividades', 'salaMateriais'].forEach(function (k) { D[k] = D[k].filter(function (x) { return x.salaId !== it.id; }); }); } },
    salaAvisos: { path: 'salaAvisos', titulo: 'Avisos das salas', sing: 'aviso',
      cols: [['Sala', function (i) { return '<span class="tag">' + esc(nomeSala(i.salaId)) + '</span>'; }], ['Aviso', function (i) { return esc(i.texto); }], ['Data', function (i) { return fmt(i.data); }]],
      campos: [{ k: 'salaId', label: 'Sala', type: 'select', opts: salasOpts, req: true }, { k: 'texto', label: 'Aviso', type: 'textarea', req: true, rows: 3 }, { k: 'data', label: 'Data', type: 'date', req: true }],
      novo: function () { return { data: hoje(), salaId: (D.salas[0] || {}).id }; } },
    salaAtividades: { path: 'salaAtividades', titulo: 'Atividades das salas', sing: 'atividade',
      cols: [['Sala', function (i) { return '<span class="tag">' + esc(nomeSala(i.salaId)) + '</span>'; }], ['Atividade', function (i) { return '<b>' + esc(i.titulo) + '</b>'; }], ['Prazo', function (i) { return fmt(i.prazo); }]],
      campos: [{ k: 'salaId', label: 'Sala', type: 'select', opts: salasOpts, req: true }, { k: 'titulo', label: 'Título', req: true }, { k: 'desc', label: 'Instruções', type: 'textarea', rows: 3 }, { k: 'prazo', label: 'Prazo de entrega', type: 'date' }],
      novo: function () { return { salaId: (D.salas[0] || {}).id, prazo: hoje() }; } },
    salaMateriais: { path: 'salaMateriais', titulo: 'Materiais das salas', sing: 'material',
      cols: [['Sala', function (i) { return '<span class="tag">' + esc(nomeSala(i.salaId)) + '</span>'; }], ['Material', function (i) { return '<b>' + esc(i.titulo) + '</b>'; }], ['Tipo', function (i) { return esc(i.tipo); }]],
      campos: [{ k: 'salaId', label: 'Sala', type: 'select', opts: salasOpts, req: true }, { k: 'titulo', label: 'Título', req: true }, { k: 'tipo', label: 'Tipo', type: 'select', opts: ['PDF', 'Vídeo', 'Link', 'Outro'], meio: true }, { k: 'url', label: 'Endereço (link)', type: 'url', req: true, meio: true, ph: 'https://…' }],
      novo: function () { return { salaId: (D.salas[0] || {}).id, tipo: 'Link' }; } },
    usuarios: { path: 'admins', titulo: 'Usuários do painel', sing: 'usuário',
      cols: [['Usuário', function (i) { return '<b>' + esc(i.user) + '</b>' + (sessao && i.id === sessao.id ? ' <span class="tag v">você</span>' : '') + (i.hash === HASH_PADRAO ? ' <span class="tag r">senha padrão</span>' : ''); }], ['Nome', function (i) { return esc(i.nome); }]],
      campos: [{ k: 'user', label: 'Nome de usuário', req: true, meio: true, max: 30 }, { k: 'nome', label: 'Nome completo', req: true, meio: true }, { k: 'senha', label: 'Senha', type: 'password', hint: 'Mínimo de 6 caracteres. Ao editar, deixe em branco para manter a atual.' }],
      novo: function () { return {}; },
      entrada: function (i) { var c = Object.assign({}, i); c.senha = ''; return c; },
      assincrono: true,
      antes: function (v, item) {
        if (!item && v.senha.length < 6) { toast('A senha deve ter ao menos 6 caracteres.', true); return Promise.resolve(null); }
        if (v.senha && v.senha.length < 6) { toast('A senha deve ter ao menos 6 caracteres.', true); return Promise.resolve(null); }
        if (D.admins.some(function (a) { return a.user.toLowerCase() === v.user.toLowerCase() && (!item || a.id !== item.id); })) { toast('Este nome de usuário já existe.', true); return Promise.resolve(null); }
        return (v.senha ? Store.sha256(v.senha) : Promise.resolve(item.hash)).then(function (h) { v.hash = h; delete v.senha; return v; });
      },
      podeRemover: function (it) { if (D.admins.length <= 1) return 'Deve existir ao menos um usuário.'; if (sessao && it.id === sessao.id) return 'Você não pode remover o próprio usuário.'; } }
  };
  function nomeSala(id) { var s = D.salas.filter(function (x) { return x.id === id; })[0]; return s ? s.nome : '(sala removida)'; }
  function salasOpts() { return D.salas.map(function (s) { return [s.id, s.nome]; }); }

  function renderCRUD(nome) {
    var c = CRUD[nome], el = contentEl, filtro = '';
    function lista() { return getP(D, c.path); }
    function desenhar() {
      var arr = lista(), q = filtro.toLowerCase();
      var vis = arr.map(function (it, idx) { return [it, idx]; }).filter(function (p) { return !q || JSON.stringify(p[0]).toLowerCase().indexOf(q) >= 0; });
      el.innerHTML = '<div class="barra-acoes"><input class="in" type="search" id="q" placeholder="Buscar…" value="' + esc(filtro) + '" aria-label="Buscar"><span class="esp muted">' + arr.length + ' ' + (arr.length === 1 ? 'registro' : 'registros') + '</span><button class="bt bt-primario" id="novo">＋ Nova ' + esc(c.sing) + '</button></div>' +
        (vis.length ? '<div class="tabela-wrap"><table><thead><tr>' + c.cols.map(function (k) { return '<th>' + k[0] + '</th>'; }).join('') + '<th></th></tr></thead><tbody>' +
          vis.map(function (p) {
            return '<tr>' + c.cols.map(function (k) { return '<td>' + k[1](p[0]) + '</td>'; }).join('') + '<td class="acoes">' +
              (c.ordem && !q ? '<button class="bt bt-ghost bt-sm" data-m="-1" data-i="' + p[1] + '" aria-label="Subir">↑</button><button class="bt bt-ghost bt-sm" data-m="1" data-i="' + p[1] + '" aria-label="Descer">↓</button>' : '') +
              '<button class="bt bt-ghost bt-sm" data-e="' + p[1] + '">Editar</button><button class="bt bt-ghost bt-sm" data-d="' + p[1] + '" style="color:var(--vermelho)">Excluir</button></td></tr>';
          }).join('') + '</tbody></table></div>' : '<div class="painel vazio"><div class="ic">📭</div><p>' + (q ? 'Nada encontrado para esta busca.' : 'Nada cadastrado ainda.') + '</p></div>');
      $('#q', el).addEventListener('input', function (e) { filtro = e.target.value; var pos = e.target.selectionStart; desenhar(); var n = $('#q', el); n.focus(); n.setSelectionRange(pos, pos); });
      $('#novo', el).addEventListener('click', function () { form(null); });
      $$('[data-e]', el).forEach(function (b) { b.addEventListener('click', function () { form(+b.getAttribute('data-e')); }); });
      $$('[data-d]', el).forEach(function (b) {
        b.addEventListener('click', function () {
          var i = +b.getAttribute('data-d'), it = lista()[i], motivo = c.podeRemover && c.podeRemover(it);
          if (motivo) { toast(motivo, true); return; }
          if (!confirm('Excluir este item? Esta ação não pode ser desfeita.')) return;
          lista().splice(i, 1); if (c.depoisRemover) c.depoisRemover(it); salvar('Item excluído'); montarMenu(); desenhar();
        });
      });
      $$('[data-m]', el).forEach(function (b) {
        b.addEventListener('click', function () {
          var i = +b.getAttribute('data-i'), j = i + +b.getAttribute('data-m'), a = lista();
          if (j < 0 || j >= a.length) return; var t = a[i]; a[i] = a[j]; a[j] = t; salvar('Ordem atualizada'); desenhar();
        });
      });
    }
    function form(idx) {
      var item = idx == null ? null : lista()[idx], base = item ? (c.entrada ? c.entrada(item) : item) : (c.novo ? c.novo() : {});
      imgsTemp = {};
      var b = modal('<h2>' + (item ? 'Editar' : 'Nova') + ' ' + esc(c.sing) + '</h2><form id="fm" novalidate>' + camposHTML(c.campos, base) + '<div class="modal-acoes"><button type="button" class="bt bt-ghost" data-fechar>Cancelar</button><button class="bt bt-primario">Salvar</button></div></form>');
      ligarCampos(b, c.campos);
      $('#fm', b).addEventListener('submit', function (e) {
        e.preventDefault();
        var v = lerCampos(b, c.campos); if (!v) return;
        if (c.validar) { var er = c.validar(v); if (er) { toast(er, true); return; } }
        function gravar(val) {
          if (!val) return;
          if (item) Object.assign(item, val); else { val.id = Store.uid(nome.slice(0, 2)); lista().push(val); }
          if (c.ordenar) lista().sort(c.ordenar);
          if (salvar()) { fechar(); montarMenu(); desenhar(); }
        }
        if (c.antes) c.antes(v, item).then(gravar); else gravar(v);
      });
    }
    desenhar();
  }

  /* ======================= PÁGINAS DE FORMULÁRIO ÚNICO ======================= */
  /* opts: {titulo, sub, campos, extras:[{titulo, sub, campos}], topo, fim, depois} */
  function paginaForm(opts) {
    imgsTemp = {};
    var todos = opts.campos.slice(), extras = (opts.extras || []).map(function (p) {
      todos = todos.concat(p.campos);
      return '<div class="painel"><h2>' + p.titulo + '</h2>' + (p.sub ? '<p class="sub">' + p.sub + '</p>' : '') + camposHTML(p.campos, D) + '</div>';
    }).join('');
    contentEl.innerHTML = '<form id="pf" novalidate>' + (opts.topo || '') + '<div class="painel"><h2>' + opts.titulo + '</h2>' + (opts.sub ? '<p class="sub">' + opts.sub + '</p>' : '') + camposHTML(opts.campos, D) + '</div>' + extras + (opts.fim || '') +
      '<div class="salvar-barra"><button type="button" class="bt bt-ghost" id="desfazer">Descartar alterações</button><button class="bt bt-primario">💾 Salvar alterações</button></div></form>';
    ligarCampos(contentEl, todos);
    $('#desfazer').addEventListener('click', function () { rota(); toast('Alterações descartadas'); });
    $('#pf').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = lerCampos(contentEl, todos); if (!v) return;
      Object.keys(v).forEach(function (k) { setP(D, k, v[k]); });
      if (opts.depois) opts.depois(v);
      salvar();
    });
  }

  var PAGINAS = {};

  PAGINAS.config = function () {
    var campos = [
      { k: 'settings.nome', label: 'Nome da escola', req: true }, { k: 'settings.sigla', label: 'Sigla do logotipo (até 3 letras)', meio: true, max: 3 }, { k: 'settings.anoLetivo', label: 'Ano letivo', meio: true },
      { k: 'settings.slogan', label: 'Slogan' }, { k: 'settings.descricao', label: 'Descrição curta', type: 'textarea', rows: 3 },
      { k: 'settings.logo', label: 'Logotipo (imagem quadrada)', type: 'image', max: 300, hint: 'Se não enviar, o site usa o logotipo com a sigla.' },
      { k: 'settings.endereco', label: 'Endereço' }, { k: 'settings.telefone', label: 'Telefone', meio: true }, { k: 'settings.email', label: 'E-mail', type: 'email', meio: true },
      { k: 'settings.whatsapp', label: 'WhatsApp (somente números, com 55 e DDD)', meio: true, ph: '5571999999999' }, { k: 'settings.horario', label: 'Horário de atendimento', meio: true },
      { k: 'settings.instagram', label: 'Instagram (link)', type: 'url', meio: true }, { k: 'settings.facebook', label: 'Facebook (link)', type: 'url', meio: true }, { k: 'settings.youtube', label: 'YouTube (link)', type: 'url' },
      { k: 'settings.mapaEmbed', label: 'Mapa (endereço de incorporação)', type: 'url', hint: 'No Google Maps ou OpenStreetMap: Compartilhar → Incorporar mapa → copie o endereço do atributo src.' },
      { k: 'settings.avisoTopo', label: 'Aviso na faixa do topo do site' }, { k: 'settings.mostrarAviso', label: 'Exibir a faixa de aviso', type: 'switch' }
    ];
    paginaForm({ titulo: 'Configurações gerais', sub: 'Dados institucionais exibidos em todo o site.', campos: campos, depois: function () { montarMenu(); } });
  };

  var PRESETS = [
    ['Bahia (padrão)', { azul: '#1747B8', marinho: '#0B1F4B', vermelho: '#D7263D', amarelo: '#FFB400', verde: '#1FA971', papel: '#F5F8FF' }],
    ['Pelourinho', { azul: '#0F6FA8', marinho: '#12324A', vermelho: '#C8442B', amarelo: '#F2B134', verde: '#2E9E6B', papel: '#F4F8FA' }],
    ['Dendê', { azul: '#264DA0', marinho: '#1A1F4B', vermelho: '#E4572E', amarelo: '#FFA630', verde: '#17A398', papel: '#FFF8F0' }],
    ['Mar de Salvador', { azul: '#0077B6', marinho: '#023E6B', vermelho: '#EF476F', amarelo: '#FFD166', verde: '#06D6A0', papel: '#F0F8FF' }]
  ];
  PAGINAS.aparencia = function () {
    var campos = [{ k: 'settings.cores.azul', label: 'Azul azulejo (cor principal)', type: 'color' }, { k: 'settings.cores.marinho', label: 'Azul-marinho (títulos e rodapé)', type: 'color' }, { k: 'settings.cores.vermelho', label: 'Vermelho Bahia (destaques)', type: 'color' }, { k: 'settings.cores.amarelo', label: 'Amarelo dendê (botões)', type: 'color' }, { k: 'settings.cores.verde', label: 'Verde fita do Bonfim', type: 'color' }, { k: 'settings.cores.papel', label: 'Cor de fundo das páginas', type: 'color' }];
    var secoes = [['noticias', 'Notícias'], ['agenda', 'Agenda'], ['galeria', 'Galeria'], ['jogos', 'Jogos didáticos'], ['salas', 'Salas virtuais'], ['equipe', 'Equipe'], ['depoimentos', 'Depoimentos']];
    var sc = secoes.map(function (s) { return { k: 'settings.secoes.' + s[0], label: s[1], type: 'switch' }; });
    var todos = campos.concat(sc);
    var topo = '<div class="painel"><h2>Paletas prontas</h2><p class="sub">Clique para aplicar e depois ajuste cada cor, se quiser.</p><div class="presets">' +
      PRESETS.map(function (p, i) { var c = p[1]; return '<button type="button" class="preset" data-pr="' + i + '"><i>' + [c.azul, c.marinho, c.vermelho, c.amarelo, c.verde].map(function (x) { return '<b style="background:' + x + '"></b>'; }).join('') + '</i>' + p[0] + '</button>'; }).join('') + '</div>' +
      '<div class="previa" id="previa"><div class="p-top" id="pv-top"><h3>Prévia do site</h3><p style="margin:0">Assim ficam os títulos, o topo e o rodapé.</p></div><div class="p-fim" id="pv-fim"><span id="pv-1">Botão principal</span><span id="pv-2">Destaque</span><span id="pv-3" style="color:#0B1F4B">Amarelo</span><span id="pv-4">Verde</span></div></div></div>';
    paginaForm({ titulo: 'Cores do site', sub: 'As cores se aplicam a todas as páginas públicas.', campos: campos, topo: topo,
      extras: [{ titulo: 'Seções do site', sub: 'Desative o que a escola não quer exibir. A página some do menu.', campos: sc }] });
    function previa() {
      var g = function (k) { return $('#f_' + ('settings.cores.' + k).replace(/\W/g, '_')).value; };
      $('#pv-top').style.background = 'linear-gradient(160deg,' + g('marinho') + ',' + g('azul') + ')'; $('#pv-fim').style.background = g('papel');
      $('#pv-1').style.background = g('azul'); $('#pv-2').style.background = g('vermelho'); $('#pv-3').style.background = g('amarelo'); $('#pv-4').style.background = g('verde');
    }
    $$('input[type=color]', contentEl).forEach(function (c) { c.addEventListener('input', previa); }); previa();
    $$('[data-pr]', contentEl).forEach(function (b) {
      b.addEventListener('click', function () {
        var c = PRESETS[+b.getAttribute('data-pr')][1];
        Object.keys(c).forEach(function (k) { var el = $('#f_' + ('settings.cores.' + k).replace(/\W/g, '_')); el.value = c[k]; var o = $('[data-cv="' + el.id + '"]'); if (o) o.textContent = c[k]; });
        previa(); toast('Paleta aplicada. Clique em Salvar para confirmar.');
      });
    });
  };

  PAGINAS.inicio = function () {
    var campos = [{ k: 'hero.titulo', label: 'Título principal', req: true, hint: 'Aparece em destaque, com animação palavra por palavra.' }, { k: 'hero.subtitulo', label: 'Subtítulo', type: 'textarea', rows: 2 },
      { k: 'hero.cta1Texto', label: 'Botão 1 — texto', meio: true }, { k: 'hero.cta1Link', label: 'Botão 1 — link', meio: true, ph: '#/salas' }, { k: 'hero.cta2Texto', label: 'Botão 2 — texto', meio: true }, { k: 'hero.cta2Link', label: 'Botão 2 — link', meio: true, ph: '#/jogos' }];
    var stats = [0, 1, 2, 3].reduce(function (a, i) { return a.concat([{ k: 'hero.stats.' + i + '.n', label: 'Número ' + (i + 1), type: 'number', meio: true }, { k: 'hero.stats.' + i + '.label', label: 'Descrição ' + (i + 1), meio: true }]); }, []);
    paginaForm({ titulo: 'Topo da página inicial', sub: 'Chamada principal, botões e números de destaque.', campos: campos.concat(stats) });
  };

  PAGINAS.sobre = function () {
    paginaForm({ titulo: 'Sobre a escola', sub: 'Textos da página "A escola" e do início do site.', campos: [
      { k: 'sobre.historia', label: 'História', type: 'textarea', rows: 10, hint: 'Separe os parágrafos com uma linha em branco. O primeiro parágrafo aparece também na página inicial.' },
      { k: 'sobre.missao', label: 'Missão', type: 'textarea', rows: 3 }, { k: 'sobre.visao', label: 'Visão', type: 'textarea', rows: 3 },
      { k: 'sobre.valores', label: 'Valores (um por linha)', type: 'lines', rows: 6 }] });
  };

  PAGINAS.jogos = function () {
    var j = [['quiz', '🧠 Quiz da Turma'], ['memoria', '🃏 Jogo da Memória'], ['forca', '🪢 Forca'], ['matematica', '⚡ Matemática Relâmpago'], ['caca', '🔎 Caça-palavras']];
    var campos = j.map(function (x) { return { k: 'jogos.ativos.' + x[0], label: x[1], type: 'switch' }; });
    var atalhos = '<div class="painel"><h2>Conteúdo dos jogos</h2><div class="barra-acoes"><a class="bt bt-ghost" href="#/quiz">🧠 Perguntas (' + D.jogos.quiz.length + ')</a><a class="bt bt-ghost" href="#/memoria">🃏 Pares (' + D.jogos.memoria.length + ')</a><a class="bt bt-ghost" href="#/forca">🪢 Palavras (' + D.jogos.forca.length + ')</a><a class="bt bt-ghost" href="#/caca">🔎 Temas (' + D.jogos.caca.length + ')</a></div></div>';
    paginaForm({ titulo: 'Jogos disponíveis', sub: 'Ative ou desative cada jogo. "Matemática Relâmpago" gera as contas automaticamente.', campos: campos, fim: atalhos });
  };

  /* ---- mensagens ---- */
  function todasMensagens() {
    var loc = []; try { loc = JSON.parse(localStorage.getItem('bb_msgs_visitante')) || []; } catch (e) {}
    var ids = {}; var out = [];
    (D ? D.mensagens : []).concat(loc).forEach(function (m) { if (!ids[m.id]) { ids[m.id] = 1; out.push(m); } });
    return out.sort(function (a, b) { return String(b.data).localeCompare(String(a.data)); });
  }
  function salvarMsgLocais(lista) { try { localStorage.setItem('bb_msgs_visitante', JSON.stringify(lista.filter(function (m) { return m._local; }))); } catch (e) {} }
  PAGINAS.mensagens = function () {
    var loc = []; try { loc = JSON.parse(localStorage.getItem('bb_msgs_visitante')) || []; } catch (e) {}
    var locIds = {}; loc.forEach(function (m) { locIds[m.id] = 1; });
    function desenhar() {
      var l = todasMensagens();
      contentEl.innerHTML = '<div class="aviso-box azul">As mensagens do formulário do site são enviadas pelo e-mail ou WhatsApp da escola. Esta caixa mostra as mensagens registradas <b>neste navegador</b>.</div>' +
        (l.length ? l.map(function (m) {
          return '<article class="msg-card' + (m.lida ? '' : ' nova') + '"><header><div><b>' + esc(m.nome) + '</b> <span class="muted">&lt;' + esc(m.email) + '&gt;</span></div><div><span class="tag">' + esc(m.assunto) + '</span> <span class="muted">' + new Date(m.data).toLocaleString('pt-BR') + '</span></div></header><p>' + esc(m.texto) + '</p>' +
            '<div class="barra-acoes" style="margin:0"><a class="bt bt-primario bt-sm" href="mailto:' + esc(m.email) + '?subject=' + encodeURIComponent('Re: ' + m.assunto) + '">Responder</a><button class="bt bt-ghost bt-sm" data-l="' + esc(m.id) + '">' + (m.lida ? 'Marcar como nova' : 'Marcar como lida') + '</button><button class="bt bt-ghost bt-sm" style="color:var(--vermelho)" data-x="' + esc(m.id) + '">Excluir</button></div></article>';
        }).join('') : '<div class="painel vazio"><div class="ic">📭</div><p>Nenhuma mensagem registrada.</p></div>');
      $$('[data-l]').forEach(function (b) { b.onclick = function () { alt(b.getAttribute('data-l'), function (m) { m.lida = !m.lida; }); }; });
      $$('[data-x]').forEach(function (b) { b.onclick = function () { if (!confirm('Excluir esta mensagem?')) return; var id = b.getAttribute('data-x'); D.mensagens = D.mensagens.filter(function (m) { return m.id !== id; }); loc = loc.filter(function (m) { return m.id !== id; }); try { localStorage.setItem('bb_msgs_visitante', JSON.stringify(loc)); } catch (e) {} salvar('Mensagem excluída'); montarMenu(); desenhar(); }; });
    }
    function alt(id, fn) {
      var m = D.mensagens.filter(function (x) { return x.id === id; })[0];
      if (!m) { m = loc.filter(function (x) { return x.id === id; })[0]; if (m) { fn(m); try { localStorage.setItem('bb_msgs_visitante', JSON.stringify(loc)); } catch (e) {} } }
      else { fn(m); Store.save(D); }
      montarMenu(); desenhar();
    }
    desenhar();
  };

  /* ---- backup ---- */
  PAGINAS.backup = function () {
    var json = Store.exportJSON(), kb = Math.round(json.length / 1024), pct = Math.min(100, Math.round(kb / 5120 * 100));
    contentEl.innerHTML = '<div class="painel"><h2>Como publicar suas alterações</h2><p class="sub">O painel grava no navegador de quem edita. Para que todos os visitantes vejam as mudanças:</p><ol style="margin:0;padding-left:1.2rem"><li>Clique em <b>Baixar arquivo de publicação</b>.</li><li>Envie o arquivo para a hospedagem do site na pasta <code>assets/data/</code> com o nome <code>site-data.json</code> (substituindo o anterior).</li><li>Pronto: visitantes que não editaram o site neste navegador passam a ver o conteúdo novo.</li></ol>' +
      '<div class="barra-acoes" style="margin-top:1.2rem"><button class="bt bt-primario" id="b-pub">⬇ Baixar arquivo de publicação</button></div></div>' +
      '<div class="painel"><h2>Backup e restauração</h2><div class="barra-acoes"><button class="bt bt-ghost" id="b-exp">Exportar backup (.json)</button><label class="bt bt-ghost" style="margin:0;cursor:pointer">Importar backup<input type="file" id="b-imp" accept=".json,application/json" hidden></label><button class="bt bt-ghost" id="b-reset" style="color:var(--vermelho)">Restaurar conteúdo original</button></div>' +
      '<p class="muted" style="margin:.8rem 0 .4rem">Armazenamento usado neste navegador: <b>' + kb + ' KB</b> de cerca de 5.000 KB.</p><div class="barra-uso"><i style="width:' + pct + '%"></i></div></div>';
    function baixar(nome) { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([Store.exportJSON()], { type: 'application/json' })); a.download = nome; document.body.appendChild(a); a.click(); a.remove(); }
    $('#b-pub').onclick = function () { baixar('site-data.json'); toast('Arquivo gerado. Envie para assets/data/'); };
    $('#b-exp').onclick = function () { baixar('backup-barros-barreto-' + hoje() + '.json'); toast('Backup baixado'); };
    $('#b-imp').onchange = function (e) {
      var f = e.target.files[0]; if (!f) return; var r = new FileReader();
      r.onload = function () { try { if (confirm('Importar este arquivo substituirá todo o conteúdo atual. Continuar?')) { Store.importJSON(r.result); D = Store.get(); toast('Backup importado'); montarMenu(); PAGINAS.backup(); } } catch (x) { toast('Arquivo inválido.', true); } };
      r.readAsText(f);
    };
    $('#b-reset').onclick = function () { if (confirm('Restaurar o conteúdo original? Todas as suas edições serão apagadas deste navegador.')) { Store.reset(); D = Store.get(); salvar('Conteúdo restaurado'); montarMenu(); PAGINAS.backup(); } };
  };

  /* ---- painel ---- */
  PAGINAS.painel = function () {
    var novas = todasMensagens().filter(function (m) { return !m.lida; }), futuros = D.agenda.filter(function (a) { return a.data >= hoje(); }).length;
    var senhaPadrao = D.admins.some(function (a) { return a.hash === HASH_PADRAO; });
    var k = [['📰', D.noticias.length, 'Notícias', 'noticias', '#1747B8'], ['📅', futuros, 'Eventos futuros', 'agenda', '#1FA971'], ['🎓', D.salas.length, 'Salas virtuais', 'salas', '#D7263D'], ['🧠', D.jogos.quiz.length, 'Perguntas do quiz', 'quiz', '#FFB400'], ['🖼️', D.galeria.length, 'Fotos', 'galeria', '#7b3fe4'], ['✉️', novas.length, 'Mensagens novas', 'mensagens', '#D7263D']];
    contentEl.innerHTML = '<div class="painel" style="background:linear-gradient(120deg,#0B1F4B,#1747B8);color:#fff;border:0"><h2 style="color:#fff;font-size:1.5rem">Olá, ' + esc((sessao.nome || sessao.user).split(' ')[0]) + '! 👋</h2><p style="margin:0;opacity:.9">Aqui você controla todo o conteúdo do site do ' + esc(D.settings.nome) + '.</p></div>' +
      (senhaPadrao ? '<div class="aviso-box"><b>Atenção:</b> ainda existe um usuário com a senha padrão. <a href="#/usuarios">Troque a senha agora</a>.</div>' : '') +
      '<div class="grade">' + k.map(function (x) { return '<a class="kpi" href="#/' + x[3] + '" style="--c:' + x[4] + '"><div class="ic">' + x[0] + '</div><b>' + x[1] + '</b><span>' + x[2] + '</span></a>'; }).join('') + '</div>' +
      '<div class="painel"><h2>Ações rápidas</h2><div class="barra-acoes"><a class="bt bt-primario" href="#/noticias">＋ Publicar notícia</a><a class="bt bt-ghost" href="#/agenda">＋ Novo evento</a><a class="bt bt-ghost" href="#/salaAvisos">＋ Aviso em sala</a><a class="bt bt-ghost" href="#/quiz">＋ Pergunta do quiz</a><a class="bt bt-ghost" href="#/aparencia">🎨 Mudar cores</a><a class="bt bt-ghost" href="#/backup">💾 Publicar</a></div></div>' +
      '<div class="painel"><h2>Últimas mensagens</h2>' + (novas.length ? novas.slice(0, 4).map(function (m) { return '<p style="margin:.3rem 0"><b>' + esc(m.nome) + '</b> — ' + esc(m.assunto) + ' <span class="muted">(' + new Date(m.data).toLocaleDateString('pt-BR') + ')</span></p>'; }).join('') : '<p class="muted" style="margin:0">Nenhuma mensagem nova.</p>') + '</div>';
  };

  /* ======================= ROTEADOR ======================= */
  function rota() {
    if (!sessao) return;
    var nome = (location.hash || '#/painel').replace(/^#\/?/, '') || 'painel';
    if (!PAGINAS[nome] && !CRUD[nome]) nome = 'painel';
    $('#titulo-pg').textContent = (CRUD[nome] && CRUD[nome].titulo) || TITULOS[nome] || 'Painel';
    $$('#menu a').forEach(function (a) { a.classList.toggle('ativo', a.getAttribute('data-p') === nome); });
    D = Store.get();
    if (PAGINAS[nome]) PAGINAS[nome](); else renderCRUD(nome);
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', rota);

  /* ======================= INÍCIO ======================= */
  Store.carregarPublicado('../assets/data/site-data.json').then(function () {
    D = Store.get();
    try { sessao = JSON.parse(sessionStorage.getItem(SESSAO)); } catch (e) { sessao = null; }
    if (sessao && D.admins.some(function (a) { return a.id === sessao.id; })) entrar();
  });
  D = Store.get();
})();
