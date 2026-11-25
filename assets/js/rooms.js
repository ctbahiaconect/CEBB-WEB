/* ============================================================
   Salas de aula virtuais
   - Videoaula via Jitsi Meet (funciona entre dispositivos)
   - Mural, atividades, materiais, presença e chat
   Obs.: sem servidor, o chat e a presença sincronizam entre abas
   do MESMO navegador. Veja o README para ligar a um backend.
   ============================================================ */
(function (global) {
  'use strict';
  var UI = global.UI, SES_KEY = 'bb_sessao_sala', timers = [], listeners = [];

  function ses() { try { return JSON.parse(localStorage.getItem(SES_KEY)); } catch (e) { return null; } }
  function setSes(s) { try { localStorage.setItem(SES_KEY, JSON.stringify(s)); } catch (e) {} }
  function lerJSON(k, def) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function slug(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]/g, ''); }

  function parar() {
    timers.forEach(clearInterval); timers = [];
    listeners.forEach(function (l) { global.removeEventListener(l[0], l[1]); }); listeners = [];
  }

  /* ---------- lista / login ---------- */
  function lista(el, data) {
    parar();
    var s = ses();
    if (!s) {
      el.innerHTML = '<div class="card login-sala reveal"><h3>Identifique-se para entrar</h3><p style="color:var(--suave)">Use o nome que aparecerá para sua turma. Não é necessário senha.</p>' +
        '<form class="form" id="f-ses"><div class="campo"><label for="ses-nome">Nome completo</label><input class="input" id="ses-nome" required maxlength="40" autocomplete="name"></div>' +
        '<div class="campo"><label for="ses-perfil">Perfil</label><select class="select" id="ses-perfil"><option value="aluno">Estudante</option><option value="professor">Professor(a)</option><option value="responsavel">Responsável</option></select></div>' +
        '<button class="btn btn-primario" style="width:100%">Entrar nas salas</button></form></div>';
      el.querySelector('#f-ses').addEventListener('submit', function (e) {
        e.preventDefault();
        setSes({ nome: el.querySelector('#ses-nome').value.trim(), perfil: el.querySelector('#ses-perfil').value });
        lista(el, data); UI.observar(el);
      });
      return;
    }
    var salas = data.salas || [];
    el.innerHTML = '<div class="busca"><div style="flex:1;min-width:200px"><b>Olá, ' + UI.esc(s.nome.split(' ')[0]) + '!</b> <span style="color:var(--suave)">(' + { aluno: 'Estudante', professor: 'Professor(a)', responsavel: 'Responsável' }[s.perfil] + ')</span></div>' +
      '<form id="f-cod" style="display:flex;gap:.5rem"><input class="input" id="cod" placeholder="Código da sala" style="max-width:180px" maxlength="12"><button class="btn btn-ghost btn-sm">Entrar</button></form>' +
      '<button class="btn btn-sm btn-ghost" id="sair-ses">Sair</button></div>' +
      (salas.length ? '<div class="grid g3">' + salas.map(function (sa, i) {
        var ativa = lerJSON('bb_aovivo_' + sa.id, 0) > Date.now() - 4 * 3600 * 1000;
        return '<article class="card sala-card hover reveal" style="padding:0"><div class="faixa" style="background-color:' + UI.esc(sa.cor || '#1747B8') + '"><small>' + UI.esc(sa.disciplina) + '</small><h3>' + UI.esc(sa.nome) + '</h3></div>' +
          '<div class="info"><span>👤 <b>' + UI.esc(sa.professor) + '</b></span><span>🗓 ' + UI.esc(sa.dia) + ' · ' + UI.esc(sa.horario) + '</span><span>' + UI.esc(sa.descricao || '') + '</span></div>' +
          '<div class="rodape"><a class="btn btn-primario btn-sm" href="#/salas/' + UI.esc(sa.id) + '">Entrar na sala</a>' + (ativa ? '<span class="ao-vivo">AO VIVO</span>' : '') + '</div></article>';
      }).join('') + '</div>' : '<div class="vazio"><div class="ic">🏫</div><p>Nenhuma sala cadastrada ainda.</p></div>');
    el.querySelector('#sair-ses').addEventListener('click', function () { localStorage.removeItem(SES_KEY); lista(el, data); UI.observar(el); });
    el.querySelector('#f-cod').addEventListener('submit', function (e) {
      e.preventDefault();
      var c = el.querySelector('#cod').value.trim().toUpperCase();
      var sa = salas.filter(function (x) { return String(x.codigo).toUpperCase() === c; })[0];
      if (sa) location.hash = '#/salas/' + sa.id; else UI.toast('Código não encontrado.');
    });
  }

  /* ---------- sala ---------- */
  function sala(el, data, id) {
    parar();
    var s = ses(), sa = (data.salas || []).filter(function (x) { return x.id === id; })[0];
    if (!sa) { el.innerHTML = '<div class="vazio"><div class="ic">🔍</div><p>Sala não encontrada.</p><a class="btn btn-primario" href="#/salas">Voltar às salas</a></div>'; return; }
    if (!s) { location.hash = '#/salas'; return; }
    var prof = s.perfil === 'professor';
    var avisosExtra = lerJSON('bb_avisos_' + id, []);
    var avisos = (data.salaAvisos || []).filter(function (a) { return a.salaId === id; }).concat(avisosExtra).sort(function (a, b) { return String(b.data).localeCompare(String(a.data)); });
    var ativs = (data.salaAtividades || []).filter(function (a) { return a.salaId === id; });
    var mats = (data.salaMateriais || []).filter(function (a) { return a.salaId === id; });
    var entKey = 'bb_entregas_' + slug(s.nome) + '_' + id, entregas = lerJSON(entKey, {});
    var chatKey = 'bb_chat_' + id, presKey = 'bb_pres_' + id, liveKey = 'bb_aovivo_' + id;
    var jitsi = 'CEBB' + slug(sa.id + sa.codigo) + 'Aula';

    el.innerHTML = '<a href="#/salas" class="btn btn-ghost btn-sm" style="margin-bottom:1rem">← Todas as salas</a>' +
      '<div class="sala-layout"><div><div class="sala-video" id="video"><div class="espera"><div><div class="grande">🎥</div><h3 style="color:#fff;margin-top:.5rem">' + UI.esc(sa.nome) + '</h3><p style="color:#c3d0f3;margin-bottom:1rem">' + UI.esc(sa.professor) + ' · ' + UI.esc(sa.dia) + ' às ' + UI.esc(sa.horario) + '</p>' +
      '<button class="btn btn-amarelo" id="entrar-aula">Entrar na videoaula</button></div></div></div>' +
      '<div class="sala-barra"><button class="btn btn-sm btn-ghost" id="mao">✋ Levantar a mão</button>' +
      (sa.link ? '<a class="btn btn-sm btn-ghost" href="' + UI.esc(sa.link) + '" target="_blank" rel="noopener">Abrir link da aula</a>' : '') +
      (prof ? '<button class="btn btn-sm btn-vermelho" id="iniciar">▶ Marcar aula como ao vivo</button><button class="btn btn-sm btn-ghost" id="novo-aviso">📣 Novo aviso</button>' : '') + '</div>' +
      '<div class="abas" role="tablist">' + ['Mural', 'Atividades', 'Materiais', 'Participantes'].map(function (t, i) { return '<button class="aba' + (i ? '' : ' ativo') + '" data-aba="' + i + '" role="tab">' + t + '</button>'; }).join('') + '</div>' +
      '<div id="aba-conteudo"></div></div>' +
      '<aside class="chat"><div class="chat-topo"><span>💬 Chat da turma</span><span class="chip" id="n-on">0 online</span></div><div class="chat-msgs" id="msgs" aria-live="polite"></div>' +
      '<form id="f-chat"><input class="input" id="chat-in" maxlength="300" placeholder="Escreva uma mensagem" autocomplete="off" aria-label="Mensagem"><button class="btn btn-primario btn-sm">Enviar</button></form></aside></div>';

    /* ----- abas ----- */
    function aba(n) {
      var c = el.querySelector('#aba-conteudo'), h = '';
      if (n === 0) {
        h = avisos.length ? avisos.map(function (a) { return '<div class="lista-item"><div class="ic">📣</div><div><h4>' + UI.fmtData(a.data) + '</h4><p>' + UI.esc(a.texto) + '</p></div></div>'; }).join('') : '<div class="vazio"><div class="ic">📭</div><p>Sem avisos por enquanto.</p></div>';
      } else if (n === 1) {
        h = ativs.length ? ativs.map(function (a) {
          var e = entregas[a.id] || {}, atras = a.prazo && a.prazo < UI.hoje() && !e.ok;
          return '<div class="lista-item"><div class="ic">' + (e.ok ? '✅' : atras ? '⏰' : '📝') + '</div><div style="flex:1"><h4>' + UI.esc(a.titulo) + '</h4><p>' + UI.esc(a.desc) + '</p><p><b>Prazo:</b> ' + UI.fmtData(a.prazo) + (atras ? ' <span style="color:var(--vermelho)">(vencida)</span>' : '') + '</p>' +
            (prof ? '' : '<textarea class="input" rows="2" data-r="' + a.id + '" placeholder="Escreva sua resposta ou observação" style="margin:.6rem 0">' + UI.esc(e.texto || '') + '</textarea><button class="btn btn-sm ' + (e.ok ? 'btn-ghost' : 'btn-primario') + '" data-ent="' + a.id + '">' + (e.ok ? 'Desmarcar entrega' : 'Marcar como entregue') + '</button>') + '</div></div>';
        }).join('') : '<div class="vazio"><div class="ic">🎉</div><p>Nenhuma atividade pendente.</p></div>';
      } else if (n === 2) {
        h = mats.length ? mats.map(function (m) { return '<div class="lista-item"><div class="ic">' + ({ PDF: '📄', 'Vídeo': '🎬', Link: '🔗' }[m.tipo] || '📎') + '</div><div><h4>' + UI.esc(m.titulo) + '</h4><p>' + UI.esc(m.tipo) + '</p></div><div class="acoes"><a class="btn btn-sm btn-ghost" href="' + UI.esc(m.url) + '" target="_blank" rel="noopener">Abrir</a></div></div>'; }).join('') : '<div class="vazio"><div class="ic">📂</div><p>Nenhum material publicado.</p></div>';
      } else {
        h = '<div class="card"><h3>Em aula agora</h3><div class="presentes" id="lista-on"></div><p style="color:var(--suave);margin-top:1rem;font-size:.9rem">Professor(a): <b>' + UI.esc(sa.professor) + '</b></p></div>'; setTimeout(presenca, 0);
      }
      c.innerHTML = h;
      c.querySelectorAll('[data-ent]').forEach(function (b) {
        b.addEventListener('click', function () {
          var aid = b.getAttribute('data-ent'), t = c.querySelector('[data-r="' + aid + '"]').value;
          var cur = entregas[aid] || {}; entregas[aid] = { ok: !cur.ok, texto: t, em: new Date().toISOString() };
          gravar(entKey, entregas); UI.toast(entregas[aid].ok ? 'Atividade entregue!' : 'Entrega desmarcada.'); if (entregas[aid].ok) UI.confete(); aba(1);
        });
      });
    }
    el.querySelectorAll('.aba').forEach(function (b) {
      b.addEventListener('click', function () {
        el.querySelectorAll('.aba').forEach(function (x) { x.classList.remove('ativo'); }); b.classList.add('ativo'); aba(+b.getAttribute('data-aba'));
      });
    });
    aba(0);

    /* ----- vídeo ----- */
    el.querySelector('#entrar-aula').addEventListener('click', function () {
      var v = el.querySelector('#video');
      v.innerHTML = '<iframe allow="camera; microphone; fullscreen; display-capture; autoplay" title="Videoaula" src="https://meet.jit.si/' + jitsi + '#userInfo.displayName=%22' + encodeURIComponent(s.nome) + '%22&config.prejoinPageEnabled=false&config.startWithVideoMuted=true"></iframe>';
      sistema(s.nome + ' entrou na videoaula');
    });
    var iniciar = el.querySelector('#iniciar');
    if (iniciar) iniciar.addEventListener('click', function () { gravar(liveKey, Date.now()); sistema('▶ ' + s.nome + ' iniciou a aula ao vivo'); UI.toast('Aula marcada como ao vivo'); });
    var na = el.querySelector('#novo-aviso');
    if (na) na.addEventListener('click', function () {
      var b = UI.modal('<h3>Novo aviso para a turma</h3><form class="form" id="f-av"><div class="campo"><textarea class="input" id="av-t" rows="4" required maxlength="400" placeholder="Escreva o aviso"></textarea></div><button class="btn btn-primario">Publicar aviso</button></form><p style="color:var(--suave);font-size:.85rem;margin-top:.8rem">Este aviso fica salvo neste navegador. Para avisos permanentes, use o painel administrativo.</p>');
      b.querySelector('#f-av').addEventListener('submit', function (e) {
        e.preventDefault();
        var item = { id: 'x' + Date.now(), texto: b.querySelector('#av-t').value.trim(), data: UI.hoje() };
        avisosExtra.push(item); gravar('bb_avisos_' + id, avisosExtra); avisos.unshift(item); UI.fecharModal(); aba(0); sistema('📣 Novo aviso publicado no mural');
      });
    });
    el.querySelector('#mao').addEventListener('click', function () { sistema('✋ ' + s.nome + ' levantou a mão'); UI.toast('Pedido enviado ao professor'); });

    /* ----- chat ----- */
    var box = el.querySelector('#msgs');
    function pintar() {
      var l = lerJSON(chatKey, []);
      box.innerHTML = l.length ? l.map(function (m) {
        if (m.sis) return '<div class="msg sistema">' + UI.esc(m.t) + '</div>';
        return '<div class="msg' + (m.n === s.nome ? ' eu' : '') + '"><b>' + UI.esc(m.n) + (m.p === 'professor' ? ' · prof.' : '') + '</b>' + UI.esc(m.t) + '</div>';
      }).join('') : '<div class="msg sistema">Seja o primeiro a escrever 👋</div>';
      box.scrollTop = box.scrollHeight;
    }
    function enviar(m) { var l = lerJSON(chatKey, []); l.push(m); gravar(chatKey, l.slice(-120)); pintar(); }
    function sistema(t) { enviar({ sis: 1, t: t }); }
    el.querySelector('#f-chat').addEventListener('submit', function (e) {
      e.preventDefault();
      var i = el.querySelector('#chat-in'), t = i.value.trim(); if (!t) return;
      enviar({ n: s.nome, p: s.perfil, t: t }); i.value = '';
    });
    pintar();
    var onSt = function (e) { if (e.key === chatKey) pintar(); if (e.key === presKey) presenca(); };
    global.addEventListener('storage', onSt); listeners.push(['storage', onSt]);

    /* ----- presença ----- */
    function presenca() {
      var p = lerJSON(presKey, {}), agora = Date.now(), on = [];
      Object.keys(p).forEach(function (k) { if (agora - p[k].t < 25000) on.push(k); });
      var n = el.querySelector('#n-on'); if (n) n.textContent = on.length + ' online';
      var l = el.querySelector('#lista-on'); if (l) l.innerHTML = on.length ? on.map(function (k) { return '<span>' + UI.esc(k) + '</span>'; }).join('') : '<span style="opacity:.6">Ninguém online</span>';
    }
    function batida() { var p = lerJSON(presKey, {}); p[s.nome] = { t: Date.now() }; Object.keys(p).forEach(function (k) { if (Date.now() - p[k].t > 120000) delete p[k]; }); gravar(presKey, p); presenca(); }
    batida(); timers.push(setInterval(batida, 10000));
    sistema(s.nome + ' entrou na sala');
  }

  global.Rooms = { lista: lista, sala: sala, parar: parar };
})(window);
