/* ============================================================
   Jogos didáticos: Quiz, Memória, Forca, Matemática relâmpago
   e Caça-palavras. Conteúdo editável no painel administrativo.
   ============================================================ */
(function (global) {
  'use strict';
  var UI = global.UI;
  var limpar = [];           // funções de limpeza ao sair do jogo
  var RANK_KEY = 'bb_ranking_v1', NOME_KEY = 'bb_jogador';

  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, ''); }
  function addLimpeza(fn) { limpar.push(fn); }

  function getRank() { try { return JSON.parse(localStorage.getItem(RANK_KEY)) || {}; } catch (e) { return {}; } }
  function salvarRank(jogo, nome, pts) {
    var r = getRank(); r[jogo] = r[jogo] || [];
    r[jogo].push({ nome: nome || 'Anônimo', pts: pts, data: UI.hoje() });
    r[jogo].sort(function (a, b) { return b.pts - a.pts; });
    r[jogo] = r[jogo].slice(0, 10);
    try { localStorage.setItem(RANK_KEY, JSON.stringify(r)); } catch (e) {}
  }
  function rankHTML(jogo) {
    var l = (getRank()[jogo] || []);
    if (!l.length) return '<p style="color:var(--suave)">Ninguém jogou ainda. Seja o primeiro do ranking!</p>';
    return '<ol>' + l.map(function (x) { return '<li><b>' + UI.esc(x.nome) + '</b> — ' + x.pts + ' pts <small style="color:var(--suave)">(' + UI.fmtData(x.data) + ')</small></li>'; }).join('') + '</ol>';
  }
  function telaFinal(el, jogo, pts, msg, reiniciar) {
    var nome = '';
    try { nome = localStorage.getItem(NOME_KEY) || ''; } catch (e) {}
    el.innerHTML = '<div class="resultado"><div class="trofeu">🏆</div><h2>' + UI.esc(msg) + '</h2><p style="font-size:1.3rem">Você fez <b style="color:var(--azul)">' + pts + ' pontos</b></p>' +
      '<form class="resp-form" id="f-rank" style="margin:1rem auto"><input class="input" style="font-size:1rem;font-weight:600" maxlength="24" placeholder="Seu nome para o ranking" value="' + UI.esc(nome) + '" aria-label="Seu nome"><button class="btn btn-primario">Salvar</button></form>' +
      '<button class="btn btn-ghost" id="b-again">Jogar de novo</button>' +
      '<div class="ranking" style="text-align:left"><h3>Ranking</h3><div id="rank-box">' + rankHTML(jogo) + '</div></div></div>';
    UI.confete();
    el.querySelector('#f-rank').addEventListener('submit', function (e) {
      e.preventDefault();
      var n = e.target.querySelector('input').value.trim() || 'Anônimo';
      try { localStorage.setItem(NOME_KEY, n); } catch (x) {}
      salvarRank(jogo, n, pts);
      el.querySelector('#rank-box').innerHTML = rankHTML(jogo);
      e.target.remove(); UI.toast('Pontuação salva!');
    });
    el.querySelector('#b-again').addEventListener('click', reiniciar);
  }
  function vazio(el, txt) { el.innerHTML = '<div class="vazio"><div class="ic">🛠️</div><p>' + txt + '</p></div>'; }

  /* ---------------------------- QUIZ ---------------------------- */
  function quiz(el, dados) {
    var todas = dados.quiz || [];
    if (!todas.length) return vazio(el, 'Ainda não há perguntas cadastradas. Os administradores podem adicioná-las no painel.');
    var discs = []; todas.forEach(function (q) { if (q.disc && discs.indexOf(q.disc) < 0) discs.push(q.disc); });
    el.innerHTML = '<div class="resultado"><div class="trofeu">🧠</div><h2>Quiz da Turma</h2><p>Responda até 10 perguntas. Acertos seguidos valem pontos extras!</p>' +
      '<div class="busca" style="justify-content:center"><select class="select" id="q-disc" style="max-width:260px"><option value="">Todas as disciplinas</option>' +
      discs.map(function (d) { return '<option>' + UI.esc(d) + '</option>'; }).join('') + '</select><button class="btn btn-primario" id="q-ini">Começar</button></div></div>';
    el.querySelector('#q-ini').addEventListener('click', function () {
      var d = el.querySelector('#q-disc').value;
      var pool = UI.shuffle(todas.filter(function (q) { return !d || q.disc === d; })).slice(0, 10);
      jogar(pool);
    });
    function jogar(pool) {
      var i = 0, pts = 0, seq = 0, acertos = 0;
      function mostrar() {
        var q = pool[i];
        var ordem = UI.shuffle(q.opcoes.map(function (t, k) { return { t: t, k: k }; }).filter(function (o) { return o.t; }));
        el.innerHTML = '<div class="palco-topo" style="margin-top:0"><span class="chip">' + UI.esc(q.disc || 'Geral') + '</span><div class="placar"><span class="pill">Pergunta <b>' + (i + 1) + '/' + pool.length + '</b></span><span class="pill">Pontos <b>' + pts + '</b></span><span class="pill">🔥 <b>' + seq + '</b></span></div></div>' +
          '<div class="barra"><i style="width:' + (i / pool.length * 100) + '%"></i></div><div class="pergunta">' + UI.esc(q.pergunta) + '</div>' +
          '<div class="opcoes">' + ordem.map(function (o, n) { return '<button class="opcao" data-k="' + o.k + '"><span class="letra">' + 'ABCD'[n] + '</span>' + UI.esc(o.t) + '</button>'; }).join('') + '</div><div class="feedback" id="fb"></div>';
        requestAnimationFrame(function () { var b = el.querySelector('.barra i'); if (b) b.style.width = ((i + 1) / pool.length * 100) + '%'; });
        el.querySelectorAll('.opcao').forEach(function (b) {
          b.addEventListener('click', function () {
            var k = +b.getAttribute('data-k'), ok = k === +q.correta;
            el.querySelectorAll('.opcao').forEach(function (x) {
              x.disabled = true;
              if (+x.getAttribute('data-k') === +q.correta) x.classList.add('certa');
            });
            var fb = el.querySelector('#fb');
            if (ok) { seq++; acertos++; pts += 10 + Math.min(seq - 1, 5) * 2; fb.className = 'feedback ok'; fb.textContent = '✅ Muito bem! ' + (seq > 1 ? seq + ' acertos seguidos!' : ''); }
            else { seq = 0; b.classList.add('errada'); fb.className = 'feedback no'; fb.textContent = '❌ Quase! A resposta certa está destacada em verde.'; }
            var prox = document.createElement('button');
            prox.className = 'btn btn-primario'; prox.style.marginTop = '1rem';
            prox.textContent = i + 1 < pool.length ? 'Próxima pergunta' : 'Ver resultado';
            el.appendChild(prox); prox.focus();
            prox.addEventListener('click', function () { i++; if (i < pool.length) mostrar(); else fim(); });
          });
        });
      }
      function fim() {
        var msg = acertos === pool.length ? 'Perfeito! Nota máxima!' : acertos >= pool.length * .6 ? 'Mandou bem!' : 'Continue praticando!';
        telaFinal(el, 'quiz', pts, msg + ' (' + acertos + '/' + pool.length + ')', function () { quiz(el, dados); });
      }
      mostrar();
    }
  }

  /* --------------------------- MEMÓRIA -------------------------- */
  function memoria(el, dados) {
    var pares = dados.memoria || [];
    if (pares.length < 3) return vazio(el, 'Cadastre ao menos 3 pares no painel para liberar este jogo.');
    el.innerHTML = '<div class="resultado"><div class="trofeu">🃏</div><h2>Jogo da Memória</h2><p>Encontre cada termo e o seu par correspondente.</p><div class="busca" style="justify-content:center">' +
      [['Fácil', 4], ['Médio', 6], ['Difícil', 8]].map(function (n) { return '<button class="btn btn-ghost" data-n="' + n[1] + '">' + n[0] + ' (' + Math.min(n[1], pares.length) + ' pares)</button>'; }).join('') + '</div></div>';
    el.querySelectorAll('[data-n]').forEach(function (b) { b.addEventListener('click', function () { jogar(Math.min(+b.getAttribute('data-n'), pares.length)); }); });
    function jogar(n) {
      var sel = UI.shuffle(pares).slice(0, n), cartas = [];
      sel.forEach(function (p) { cartas.push({ id: p.id, t: p.a }); cartas.push({ id: p.id, t: p.b }); });
      cartas = UI.shuffle(cartas);
      var viradas = [], travado = false, achados = 0, tent = 0, seg = 0;
      el.innerHTML = '<div class="palco-topo" style="margin-top:0"><span class="chip">Memória</span><div class="placar"><span class="pill">Jogadas <b id="m-t">0</b></span><span class="pill">Tempo <b id="m-s">0s</b></span><span class="pill">Pares <b id="m-p">0/' + n + '</b></span></div></div>' +
        '<div class="memoria-grid">' + cartas.map(function (c, i) { return '<button class="carta" data-i="' + i + '" aria-label="Carta ' + (i + 1) + '"><span class="lado frente">?</span><span class="lado verso">' + UI.esc(c.t) + '</span></button>'; }).join('') + '</div>';
      var timer = setInterval(function () { seg++; var s = el.querySelector('#m-s'); if (s) s.textContent = seg + 's'; }, 1000);
      addLimpeza(function () { clearInterval(timer); });
      el.querySelectorAll('.carta').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (travado || btn.classList.contains('virada') || btn.classList.contains('par')) return;
          btn.classList.add('virada'); viradas.push(btn);
          if (viradas.length === 2) {
            tent++; el.querySelector('#m-t').textContent = tent; travado = true;
            var a = cartas[+viradas[0].getAttribute('data-i')], b = cartas[+viradas[1].getAttribute('data-i')];
            if (a.id === b.id && a.t !== b.t) {
              viradas.forEach(function (v) { v.classList.remove('virada'); v.classList.add('par'); });
              achados++; el.querySelector('#m-p').textContent = achados + '/' + n; viradas = []; travado = false;
              if (achados === n) { clearInterval(timer); setTimeout(function () { var pts = Math.max(10, n * 50 - tent * 8 - seg); telaFinal(el, 'memoria', pts, 'Todos os pares encontrados!', function () { memoria(el, dados); }); }, 700); }
            } else {
              setTimeout(function () { viradas.forEach(function (v) { v.classList.remove('virada'); }); viradas = []; travado = false; }, 900);
            }
          }
        });
      });
    }
  }

  /* ----------------------------- FORCA -------------------------- */
  function forca(el, dados) {
    var lista = (dados.forca || []).filter(function (w) { return norm(w.palavra).length > 2; });
    if (!lista.length) return vazio(el, 'Cadastre palavras no painel para liberar este jogo.');
    var restantes = UI.shuffle(lista), rodada = 0, total = 0, MAX = 6;
    function nova() {
      if (!restantes.length) restantes = UI.shuffle(lista);
      var item = restantes.pop(), palavra = norm(item.palavra), certas = [], erradas = [];
      function desenhar() {
        var rev = palavra.split('').map(function (l) { return certas.indexOf(l) >= 0 ? l : ''; });
        var ganhou = rev.every(Boolean), perdeu = erradas.length >= MAX;
        el.innerHTML = '<div class="palco-topo" style="margin-top:0"><span class="chip">' + UI.esc(item.disc || 'Forca') + '</span><div class="placar"><span class="pill">Rodada <b>' + (rodada + 1) + '</b></span><span class="pill">Pontos <b>' + total + '</b></span><span class="pill">❤️ <b>' + (MAX - erradas.length) + '</b></span></div></div>' +
          '<div class="forca-layout"><div class="forca-boneco"><svg viewBox="0 0 120 150" fill="none" stroke="#0B1F4B" stroke-width="5" stroke-linecap="round"><path d="M10 145h100M30 145V10h60v20"/>' +
          '<circle class="parte' + (erradas.length > 0 ? ' on' : '') + '" cx="90" cy="45" r="15" stroke="#D7263D"/><path class="parte' + (erradas.length > 1 ? ' on' : '') + '" d="M90 60v38" stroke="#D7263D"/><path class="parte' + (erradas.length > 2 ? ' on' : '') + '" d="M90 70l-20 15" stroke="#D7263D"/><path class="parte' + (erradas.length > 3 ? ' on' : '') + '" d="M90 70l20 15" stroke="#D7263D"/><path class="parte' + (erradas.length > 4 ? ' on' : '') + '" d="M90 98l-18 25" stroke="#D7263D"/><path class="parte' + (erradas.length > 5 ? ' on' : '') + '" d="M90 98l18 25" stroke="#D7263D"/></svg></div>' +
          '<div style="flex:1;min-width:240px"><p style="text-align:center;font-weight:700">💡 Dica: ' + UI.esc(item.dica || '') + '</p><div class="palavra-forca">' +
          rev.map(function (l, i) { return '<span>' + (l || (perdeu ? '<em style="color:var(--vermelho);font-style:normal">' + palavra[i] + '</em>' : '')) + '</span>'; }).join('') + '</div></div></div>' +
          '<div class="teclado">' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(function (l) {
            var cls = certas.indexOf(l) >= 0 ? 'ok' : erradas.indexOf(l) >= 0 ? 'no' : '';
            return '<button class="tecla ' + cls + '" data-l="' + l + '"' + (cls || ganhou || perdeu ? ' disabled' : '') + '>' + l + '</button>';
          }).join('') + '</div>';
        if (ganhou || perdeu) {
          if (ganhou) { total += 20 + (MAX - erradas.length) * 5; UI.confete(); } rodada++;
          var box = document.createElement('div'); box.className = 'resultado';
          box.innerHTML = '<h3>' + (ganhou ? '🎉 Acertou!' : '😅 Era "' + UI.esc(item.palavra) + '"') + '</h3>';
          var b1 = document.createElement('button'); b1.className = 'btn btn-primario'; b1.textContent = 'Próxima palavra';
          var b2 = document.createElement('button'); b2.className = 'btn btn-ghost'; b2.style.marginLeft = '.6rem'; b2.textContent = 'Encerrar e salvar pontos';
          box.appendChild(b1); box.appendChild(b2); el.appendChild(box);
          b1.addEventListener('click', nova);
          b2.addEventListener('click', function () { document.removeEventListener('keydown', tecla); telaFinal(el, 'forca', total, 'Fim de jogo!', function () { forca(el, dados); }); });
          document.removeEventListener('keydown', tecla);
        }
        el.querySelectorAll('.tecla').forEach(function (b) { b.addEventListener('click', function () { chute(b.getAttribute('data-l')); }); });
      }
      function chute(l) {
        if (certas.indexOf(l) >= 0 || erradas.indexOf(l) >= 0) return;
        if (palavra.indexOf(l) >= 0) certas.push(l); else erradas.push(l);
        desenhar();
      }
      function tecla(e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var l = e.key.length === 1 ? e.key.toUpperCase() : '';
        if (/^[A-Z]$/.test(l) && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) chute(l);
      }
      document.addEventListener('keydown', tecla);
      addLimpeza(function () { document.removeEventListener('keydown', tecla); });
      desenhar();
    }
    nova();
  }

  /* ---------------------- MATEMÁTICA RELÂMPAGO ------------------ */
  function matematica(el) {
    el.innerHTML = '<div class="resultado"><div class="trofeu">⚡</div><h2>Matemática Relâmpago</h2><p>Resolva o máximo de contas em 60 segundos.</p><div class="busca" style="justify-content:center">' +
      [['Fácil', 1], ['Médio', 2], ['Difícil', 3]].map(function (n) { return '<button class="btn btn-ghost" data-n="' + n[1] + '">' + n[0] + '</button>'; }).join('') + '</div></div>';
    el.querySelectorAll('[data-n]').forEach(function (b) { b.addEventListener('click', function () { jogar(+b.getAttribute('data-n')); }); });
    function rnd(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
    function gerar(n) {
      var ops = n === 1 ? ['+', '-'] : n === 2 ? ['+', '-', '×'] : ['+', '-', '×', '÷'], op = ops[rnd(0, ops.length - 1)], a, b, r;
      var m = n === 1 ? 20 : n === 2 ? 60 : 120;
      if (op === '+') { a = rnd(2, m); b = rnd(2, m); r = a + b; }
      else if (op === '-') { a = rnd(5, m); b = rnd(1, a); r = a - b; }
      else if (op === '×') { a = rnd(2, n === 2 ? 10 : 15); b = rnd(2, n === 2 ? 10 : 12); r = a * b; }
      else { b = rnd(2, 12); r = rnd(2, 12); a = b * r; }
      return { t: a + ' ' + op + ' ' + b, r: r };
    }
    function jogar(nivel) {
      var pts = 0, acertos = 0, erros = 0, seq = 0, cur = gerar(nivel), tempo = 60;
      el.innerHTML = '<div class="palco-topo" style="margin-top:0"><span class="chip">Relâmpago</span><div class="placar"><span class="pill">Pontos <b id="x-p">0</b></span><span class="pill">⏱ <b id="x-t">60</b>s</span><span class="pill">🔥 <b id="x-s">0</b></span></div></div>' +
        '<div class="tempo"><i id="x-bar" style="transform:scaleX(1);transition:transform 1s linear"></i></div><div class="conta" id="x-c"></div>' +
        '<form class="resp-form" id="x-f"><input class="input" id="x-i" type="number" inputmode="numeric" autocomplete="off" aria-label="Resposta" required><button class="btn btn-primario">Responder</button></form><div class="feedback" id="fb" style="text-align:center"></div>';
      var inp = el.querySelector('#x-i'), conta = el.querySelector('#x-c'), fb = el.querySelector('#fb');
      conta.textContent = cur.t + ' = ?'; inp.focus();
      var timer = setInterval(function () {
        tempo--; el.querySelector('#x-t').textContent = tempo; el.querySelector('#x-bar').style.transform = 'scaleX(' + (tempo / 60) + ')';
        if (tempo <= 0) { clearInterval(timer); telaFinal(el, 'matematica', pts, 'Tempo esgotado! ' + acertos + ' acertos', function () { matematica(el); }); }
      }, 1000);
      addLimpeza(function () { clearInterval(timer); });
      el.querySelector('#x-f').addEventListener('submit', function (e) {
        e.preventDefault();
        if (tempo <= 0) return;
        if (+inp.value === cur.r) { seq++; acertos++; pts += 10 + nivel * 2 + Math.min(seq, 10); fb.className = 'feedback ok'; fb.textContent = '✅ Certo!'; }
        else { seq = 0; erros++; pts = Math.max(0, pts - 3); fb.className = 'feedback no'; fb.textContent = '❌ Era ' + cur.r; conta.style.animation = 'none'; void conta.offsetWidth; conta.style.animation = 'treme .4s'; }
        el.querySelector('#x-p').textContent = pts; el.querySelector('#x-s').textContent = seq;
        cur = gerar(nivel); conta.textContent = cur.t + ' = ?'; inp.value = ''; inp.focus();
      });
    }
  }

  /* -------------------------- CAÇA-PALAVRAS --------------------- */
  function caca(el, dados) {
    var temas = dados.caca || [];
    if (!temas.length) return vazio(el, 'Cadastre temas de caça-palavras no painel para liberar este jogo.');
    el.innerHTML = '<div class="resultado"><div class="trofeu">🔎</div><h2>Caça-palavras</h2><p>Escolha um tema. Toque na primeira e na última letra de cada palavra.</p><div class="busca" style="justify-content:center">' +
      temas.map(function (t, i) { return '<button class="btn btn-ghost" data-i="' + i + '">' + UI.esc(t.tema) + '</button>'; }).join('') + '</div></div>';
    el.querySelectorAll('[data-i]').forEach(function (b) { b.addEventListener('click', function () { jogar(temas[+b.getAttribute('data-i')]); }); });
    function jogar(tema) {
      var palavras = (tema.palavras || []).map(norm).filter(function (p) { return p.length > 1; }).slice(0, 10);
      var N = Math.max(10, Math.min(14, palavras.reduce(function (m, p) { return Math.max(m, p.length); }, 0) + 2));
      var g, tent = 0, dirs = [[0, 1], [1, 0], [1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1], [-1, 1]];
      function montar() {
        g = []; for (var i = 0; i < N; i++) { g.push([]); for (var j = 0; j < N; j++) g[i].push(''); }
        return palavras.slice().sort(function (a, b) { return b.length - a.length; }).every(function (p) {
          for (var t = 0; t < 200; t++) {
            var d = dirs[Math.floor(Math.random() * (tent > 5 ? 3 : dirs.length))], r = Math.floor(Math.random() * N), c = Math.floor(Math.random() * N), ok = true, k;
            var rf = r + d[0] * (p.length - 1), cf = c + d[1] * (p.length - 1);
            if (rf < 0 || rf >= N || cf < 0 || cf >= N) continue;
            for (k = 0; k < p.length; k++) { var v = g[r + d[0] * k][c + d[1] * k]; if (v && v !== p[k]) { ok = false; break; } }
            if (!ok) continue;
            for (k = 0; k < p.length; k++) g[r + d[0] * k][c + d[1] * k] = p[k];
            return true;
          }
          return false;
        });
      }
      while (!montar() && tent++ < 30) {}
      var abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) if (!g[i][j]) g[i][j] = abc[Math.floor(Math.random() * 26)];
      var achadas = [], ini = null, seg = 0;
      el.innerHTML = '<div class="palco-topo" style="margin-top:0"><span class="chip">' + UI.esc(tema.tema) + '</span><div class="placar"><span class="pill">Achadas <b id="k-a">0/' + palavras.length + '</b></span><span class="pill">Tempo <b id="k-s">0s</b></span></div></div>' +
        '<div class="caca-layout"><div class="caca-grid" style="grid-template-columns:repeat(' + N + ',auto)">' +
        g.map(function (row, r) { return row.map(function (l, c) { return '<button class="caca-cel" data-r="' + r + '" data-c="' + c + '" aria-label="Letra ' + l + '">' + l + '</button>'; }).join(''); }).join('') +
        '</div><div><h3>Palavras</h3><div class="caca-lista">' + palavras.map(function (p) { return '<span data-p="' + p + '">' + p + '</span>'; }).join('') + '</div></div></div>';
      var timer = setInterval(function () { seg++; var s = el.querySelector('#k-s'); if (s) s.textContent = seg + 's'; }, 1000);
      addLimpeza(function () { clearInterval(timer); });
      function cel(r, c) { return el.querySelector('.caca-cel[data-r="' + r + '"][data-c="' + c + '"]'); }
      el.querySelectorAll('.caca-cel').forEach(function (b) {
        b.addEventListener('click', function () {
          var r = +b.getAttribute('data-r'), c = +b.getAttribute('data-c');
          if (!ini) { ini = [r, c]; b.classList.add('sel'); return; }
          var dr = r - ini[0], dc = c - ini[1], len = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
          el.querySelectorAll('.caca-cel.sel').forEach(function (x) { x.classList.remove('sel'); });
          if ((dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) {
            var sr = Math.sign(dr), sc = Math.sign(dc), letras = '', cels = [];
            for (var k = 0; k < len; k++) { letras += g[ini[0] + sr * k][ini[1] + sc * k]; cels.push(cel(ini[0] + sr * k, ini[1] + sc * k)); }
            var rev = letras.split('').reverse().join(''), p = palavras.indexOf(letras) >= 0 ? letras : palavras.indexOf(rev) >= 0 ? rev : null;
            if (p && achadas.indexOf(p) < 0) {
              achadas.push(p); cels.forEach(function (x) { x.classList.add('achada'); });
              el.querySelector('[data-p="' + p + '"]').classList.add('feita'); el.querySelector('#k-a').textContent = achadas.length + '/' + palavras.length;
              UI.toast('Achou: ' + p + '!');
              if (achadas.length === palavras.length) { clearInterval(timer); setTimeout(function () { telaFinal(el, 'caca', Math.max(20, palavras.length * 40 - seg), 'Todas as palavras encontradas!', function () { caca(el, dados); }); }, 900); }
            }
          }
          ini = null;
        });
      });
    }
  }

  global.Games = {
    lista: [
      { id: 'quiz', nome: 'Quiz da Turma', emoji: '🧠', cls: 'jg1', desc: 'Perguntas de várias disciplinas, com pontos por sequência de acertos.', tag: 'Todas as disciplinas', fn: quiz },
      { id: 'memoria', nome: 'Jogo da Memória', emoji: '🃏', cls: 'jg2', desc: 'Combine termos e conceitos para treinar a memória.', tag: 'Revisão', fn: memoria },
      { id: 'forca', nome: 'Forca', emoji: '🪢', cls: 'jg3', desc: 'Descubra a palavra com a ajuda de uma dica.', tag: 'Vocabulário', fn: forca },
      { id: 'matematica', nome: 'Matemática Relâmpago', emoji: '⚡', cls: 'jg4', desc: 'Contas rápidas contra o relógio em 60 segundos.', tag: 'Matemática', fn: matematica },
      { id: 'caca', nome: 'Caça-palavras', emoji: '🔎', cls: 'jg5', desc: 'Encontre as palavras escondidas na grade de letras.', tag: 'Atenção', fn: caca }
    ],
    parar: function () { limpar.forEach(function (f) { try { f(); } catch (e) {} }); limpar = []; },
    iniciar: function (id, el, dados) {
      Games.parar();
      var j = Games.lista.filter(function (x) { return x.id === id; })[0];
      if (j) j.fn(el, dados);
    }
  };
  var Games = global.Games;
})(window);
