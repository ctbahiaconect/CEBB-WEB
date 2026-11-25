/* Utilitários de interface compartilhados pelo site público */
(function (global) {
  'use strict';

  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var MESES_C = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  var CORES = ['#1747B8', '#D7263D', '#1FA971', '#e89a00', '#7b3fe4', '#0B1F4B'];
  var EMOJIS = ['📚', '🔬', '🎨', '🌴', '⚽', '🎶', '🧮', '🌎'];

  var UI = {
    MESES: MESES,
    esc: function (s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },
    /* converte texto simples em parágrafos seguros */
    paragrafos: function (t) {
      return String(t || '').split(/\n{2,}/).map(function (p) {
        return '<p>' + UI.esc(p).replace(/\n/g, '<br>') + '</p>';
      }).join('');
    },
    parseData: function (iso) {
      var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
      if (!m) return null;
      return new Date(+m[1], +m[2] - 1, +m[3]);
    },
    fmtData: function (iso) {
      var d = UI.parseData(iso);
      if (!d) return '';
      return d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear();
    },
    hoje: function () {
      var d = new Date();
      return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    },
    iniciais: function (nome) {
      var p = String(nome || '?').trim().split(/\s+/);
      return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
    },
    hash: function (s) {
      var h = 0; s = String(s);
      for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
      return h;
    },
    corDe: function (s) { return CORES[UI.hash(s) % CORES.length]; },
    /* ilustração gerada quando não há imagem enviada */
    arte: function (seed, emoji) {
      var h = UI.hash(seed), c = CORES[h % CORES.length], c2 = CORES[(h >> 3) % CORES.length];
      var e = emoji || EMOJIS[h % EMOJIS.length];
      return '<div class="arte" style="background-color:' + c + ';background-image:radial-gradient(circle at 50% 50%,transparent 0 9px,rgba(255,255,255,.28) 9px 11px,transparent 11px),linear-gradient(135deg,' + c + ',' + c2 + ');background-size:44px 44px,100% 100%">' + e + '</div>';
    },
    imagemOuArte: function (img, seed, alt, emoji) {
      return img ? '<img src="' + UI.esc(img) + '" alt="' + UI.esc(alt || '') + '" loading="lazy">' : UI.arte(seed, emoji);
    },
    toast: function (msg) {
      var t = document.getElementById('toast');
      if (!t) return;
      t.textContent = msg; t.classList.add('on');
      clearTimeout(UI._tt); UI._tt = setTimeout(function () { t.classList.remove('on'); }, 2600);
    },
    modal: function (html, largo) {
      var m = document.getElementById('modal'), b = document.getElementById('modal-box');
      b.className = 'modal-box' + (largo ? ' largo' : '');
      b.innerHTML = '<button class="modal-x" aria-label="Fechar" data-fechar>✕</button>' + html;
      m.classList.add('aberto');
      document.body.style.overflow = 'hidden';
      var f = b.querySelector('input,button:not(.modal-x),select,textarea');
      if (f) setTimeout(function () { f.focus(); }, 60);
      return b;
    },
    fecharModal: function () {
      var m = document.getElementById('modal');
      if (!m) return;
      m.classList.remove('aberto');
      document.body.style.overflow = '';
    },
    /* animação de confete */
    confete: function () {
      if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var cv = document.getElementById('confete'); if (!cv) return;
      var ctx = cv.getContext('2d'), W = cv.width = innerWidth, H = cv.height = innerHeight;
      var cores = ['#1747B8', '#D7263D', '#FFB400', '#1FA971', '#ffffff'];
      var ps = [];
      for (var i = 0; i < 140; i++) ps.push({ x: W / 2 + (Math.random() - .5) * 200, y: H * .6, vx: (Math.random() - .5) * 16, vy: -Math.random() * 18 - 4, r: Math.random() * 7 + 4, c: cores[i % cores.length], a: Math.random() * 6, va: (Math.random() - .5) * .4 });
      var t0 = performance.now();
      (function frame(t) {
        ctx.clearRect(0, 0, W, H);
        ps.forEach(function (p) {
          p.vy += .5; p.x += p.vx; p.y += p.vy; p.a += p.va; p.vx *= .99;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore();
        });
        if (t - t0 < 2800) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
      })(t0);
    },
    shuffle: function (arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
      return a;
    },
    /* observador de entrada na tela e contadores */
    observar: function (raiz) {
      raiz = raiz || document;
      var els = raiz.querySelectorAll('.reveal:not(.in)');
      if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); }
      else {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
        }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
        els.forEach(function (e, i) { if (!e.style.getPropertyValue('--d')) e.style.setProperty('--d', ((i % 4) * 0.08) + 's'); io.observe(e); });
      }
      var cs = raiz.querySelectorAll('[data-conta]');
      if (!cs.length) return;
      var io2 = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { UI.contar(en.target); io2.unobserve(en.target); } });
      }, { threshold: .5 }) : null;
      cs.forEach(function (c) { if (io2) io2.observe(c); else c.textContent = c.getAttribute('data-conta'); });
    },
    contar: function (el) {
      var alvo = +el.getAttribute('data-conta') || 0, dur = 1400, t0 = performance.now();
      (function passo(t) {
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(alvo * e).toLocaleString('pt-BR');
        if (p < 1) requestAnimationFrame(passo);
      })(t0);
    }
  };

  document.addEventListener('click', function (e) {
    if (e.target.closest && (e.target.hasAttribute('data-fechar') || e.target.id === 'modal')) UI.fecharModal();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') UI.fecharModal(); });

  global.UI = UI;
})(window);
