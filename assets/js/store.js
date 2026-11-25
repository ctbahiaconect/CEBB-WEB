/* ============================================================
   Colégio Estadual Barros Barreto — Armazenamento de dados
   Compartilhado entre o site público e o painel administrativo.
   Os dados ficam no navegador (localStorage). Para publicar as
   alterações em outro computador, use Backup > Exportar/Importar.
   ============================================================ */
(function (global) {
  'use strict';
  var KEY = 'bb_site_data_v1';

  var DEFAULTS = {
    settings: {
      nome: 'Colégio Estadual Barros Barreto',
      sigla: 'CEBB',
      slogan: 'Educação pública de qualidade, com a alegria da Bahia.',
      descricao: 'Uma escola da rede estadual que une ensino sólido, tecnologia e cultura baiana para formar cidadãos preparados para o futuro.',
      endereco: 'Rua da Escola, 100 – Salvador, Bahia',
      telefone: '(71) 3000-0000',
      whatsapp: '5571900000000',
      email: 'contato@barrosbarreto.edu.br',
      horario: 'Segunda a sexta, das 7h às 21h',
      instagram: 'https://instagram.com/',
      facebook: 'https://facebook.com/',
      youtube: 'https://youtube.com/',
      mapaEmbed: 'https://www.openstreetmap.org/export/embed.html?bbox=-38.55%2C-13.02%2C-38.45%2C-12.93&layer=mapnik',
      anoLetivo: '2026',
      logo: '',
      avisoTopo: 'Matrículas 2027 abertas! Fale com a secretaria.',
      mostrarAviso: true,
      cores: { azul: '#1747B8', marinho: '#0B1F4B', vermelho: '#D7263D', amarelo: '#FFB400', verde: '#1FA971', papel: '#F5F8FF' },
      secoes: { noticias: true, agenda: true, galeria: true, jogos: true, salas: true, equipe: true, depoimentos: true }
    },
    hero: {
      titulo: 'Aqui, aprender é uma festa de cor e futuro.',
      subtitulo: 'Ensino Fundamental II, Ensino Médio e EJA com professores dedicados, jogos didáticos e salas de aula virtuais.',
      cta1Texto: 'Entrar na sala virtual', cta1Link: '#/salas',
      cta2Texto: 'Jogar e aprender', cta2Link: '#/jogos',
      stats: [
        { n: 1200, label: 'estudantes' },
        { n: 68, label: 'professores e equipe' },
        { n: 35, label: 'anos de história' },
        { n: 94, label: '% de aprovação' }
      ]
    },
    sobre: {
      historia: 'O Colégio Estadual Barros Barreto faz parte da rede pública estadual da Bahia e acolhe estudantes de diferentes bairros com um mesmo compromisso: garantir o direito à educação.\n\nAo longo dos anos, a escola construiu uma comunidade em que famílias, estudantes e profissionais da educação trabalham juntos. Edite este texto no painel administrativo com a história oficial da escola.',
      missao: 'Oferecer educação pública, gratuita e de qualidade, valorizando a diversidade, a cultura baiana e o protagonismo dos estudantes.',
      visao: 'Ser referência em ensino estadual na Bahia, reconhecida pela inovação pedagógica e pelo acolhimento.',
      valores: ['Respeito à diversidade', 'Ética e cidadania', 'Compromisso com a aprendizagem', 'Cultura e identidade baiana', 'Inovação e tecnologia', 'Gestão democrática']
    },
    cursos: [
      { id: 'c1', titulo: 'Ensino Fundamental II', nivel: '6º ao 9º ano', icone: '📚', turnos: 'Matutino e vespertino', desc: 'Base sólida em linguagens, matemática, ciências e humanidades, com projetos interdisciplinares e leitura em foco.' },
      { id: 'c2', titulo: 'Ensino Médio Regular', nivel: '1ª a 3ª série', icone: '🎓', turnos: 'Matutino e vespertino', desc: 'Preparação para o ENEM e para o mundo do trabalho, com itinerários formativos e projeto de vida.' },
      { id: 'c3', titulo: 'EJA – Educação de Jovens e Adultos', nivel: 'Tempos formativos', icone: '🌙', turnos: 'Noturno', desc: 'Retomada dos estudos com flexibilidade, acolhimento e conteúdo conectado à vida real.' },
      { id: 'c4', titulo: 'Laboratório de Ciências', nivel: 'Todas as turmas', icone: '🔬', turnos: 'Contraturno', desc: 'Experimentos, feira de ciências e iniciação científica para despertar a curiosidade.' },
      { id: 'c5', titulo: 'Cultura e Arte Baiana', nivel: 'Projeto', icone: '🥁', turnos: 'Contraturno', desc: 'Capoeira, percussão, teatro e dança que celebram as raízes afro-brasileiras da Bahia.' },
      { id: 'c6', titulo: 'Robótica e Programação', nivel: 'Projeto', icone: '🤖', turnos: 'Contraturno', desc: 'Pensamento computacional, robótica educacional e criação de jogos e aplicativos.' }
    ],
    noticias: [
      { id: 'n1', titulo: 'Feira de Ciências reúne mais de 40 projetos dos estudantes', categoria: 'Eventos', data: '2026-11-18', destaque: true, img: '', resumo: 'Experimentos, maquetes e soluções sustentáveis tomaram o pátio da escola durante dois dias.', texto: 'A Feira de Ciências do Colégio Estadual Barros Barreto reuniu estudantes de todas as séries em torno de projetos de física, química, biologia e tecnologia.\n\nOs trabalhos foram avaliados por professores convidados e a comunidade pôde visitar os estandes.\n\nParabéns a todas as turmas e aos professores orientadores!' },
      { id: 'n2', titulo: 'Salas de aula virtuais já estão disponíveis para todas as turmas', categoria: 'Tecnologia', data: '2026-11-10', destaque: false, img: '', resumo: 'Agora é possível acompanhar aulas, atividades e avisos de qualquer lugar.', texto: 'Estudantes e professores já podem acessar as salas virtuais pelo site da escola.\n\nCada turma tem mural de avisos, atividades, materiais, chat e videoaula.' },
      { id: 'n3', titulo: 'Semana da Consciência Negra celebra a cultura afro-baiana', categoria: 'Cultura', data: '2026-11-20', destaque: false, img: '', resumo: 'Rodas de conversa, capoeira e desfile de turbantes marcaram a programação.', texto: 'Durante a semana, as turmas participaram de oficinas, apresentações musicais e debates sobre identidade, história e resistência.' },
      { id: 'n4', titulo: 'Resultados do simulado ENEM e plano de reforço', categoria: 'Ensino', data: '2026-11-05', destaque: false, img: '', resumo: 'Coordenação apresenta dados e organiza aulões de revisão para o 3º ano.', texto: 'Após o simulado, a coordenação pedagógica analisou os resultados por área de conhecimento e organizou aulões gratuitos aos sábados.' }
    ],
    agenda: [
      { id: 'a1', titulo: 'Conselho de classe', data: '2026-12-02', hora: '14:00', local: 'Sala dos professores' },
      { id: 'a2', titulo: 'Reunião de pais e responsáveis', data: '2026-12-05', hora: '18:30', local: 'Auditório' },
      { id: 'a3', titulo: 'Formatura do 3º ano', data: '2026-12-12', hora: '19:00', local: 'Quadra poliesportiva' },
      { id: 'a4', titulo: 'Recuperação final', data: '2026-12-09', hora: '08:00', local: 'Salas de aula' },
      { id: 'a5', titulo: 'Confraternização de fim de ano', data: '2026-12-18', hora: '10:00', local: 'Pátio' },
      { id: 'a6', titulo: 'Início das matrículas 2027', data: '2026-11-30', hora: '08:00', local: 'Secretaria' }
    ],
    galeria: [
      { id: 'g1', legenda: 'Feira de Ciências', cat: 'Eventos', img: '' },
      { id: 'g2', legenda: 'Roda de capoeira', cat: 'Cultura', img: '' },
      { id: 'g3', legenda: 'Laboratório de informática', cat: 'Estrutura', img: '' },
      { id: 'g4', legenda: 'Quadra poliesportiva', cat: 'Estrutura', img: '' },
      { id: 'g5', legenda: 'Desfile cívico', cat: 'Eventos', img: '' },
      { id: 'g6', legenda: 'Biblioteca', cat: 'Estrutura', img: '' },
      { id: 'g7', legenda: 'Oficina de percussão', cat: 'Cultura', img: '' },
      { id: 'g8', legenda: 'Clube de robótica', cat: 'Projetos', img: '' }
    ],
    equipe: [
      { id: 'e1', nome: 'Direção Geral', cargo: 'Diretor(a)', area: 'Gestão', bio: 'Coordena a gestão democrática da escola.' },
      { id: 'e2', nome: 'Vice-direção', cargo: 'Vice-diretor(a)', area: 'Gestão', bio: 'Acompanha rotinas administrativas e disciplinares.' },
      { id: 'e3', nome: 'Coordenação Pedagógica', cargo: 'Coordenador(a)', area: 'Pedagógico', bio: 'Apoia professores e acompanha o aprendizado.' },
      { id: 'e4', nome: 'Secretaria Escolar', cargo: 'Secretário(a)', area: 'Administrativo', bio: 'Matrículas, documentos e histórico escolar.' }
    ],
    depoimentos: [
      { id: 'd1', nome: 'Ana Beatriz', papel: 'Estudante do 3º ano', texto: 'Os jogos didáticos me ajudaram muito a revisar para o ENEM sem achar chato.' },
      { id: 'd2', nome: 'Marcos Silva', papel: 'Pai de aluno', texto: 'Consigo acompanhar as atividades do meu filho pela sala virtual. Facilitou demais.' },
      { id: 'd3', nome: 'Profa. Luciana', papel: 'Professora de Português', texto: 'A sala virtual aproximou a turma e organizou meus materiais num só lugar.' }
    ],
    jogos: {
      ativos: { quiz: true, memoria: true, forca: true, matematica: true, caca: true },
      quiz: [
        { id: 'q1', disc: 'Geografia', pergunta: 'Qual é a capital da Bahia?', opcoes: ['Feira de Santana', 'Salvador', 'Ilhéus', 'Vitória da Conquista'], correta: 1 },
        { id: 'q2', disc: 'História', pergunta: 'Em que ano ocorreu a Independência da Bahia, comemorada em 2 de julho?', opcoes: ['1808', '1822', '1823', '1889'], correta: 2 },
        { id: 'q3', disc: 'Matemática', pergunta: 'Quanto é 12 × 8?', opcoes: ['88', '96', '108', '86'], correta: 1 },
        { id: 'q4', disc: 'Ciências', pergunta: 'Qual gás as plantas absorvem na fotossíntese?', opcoes: ['Oxigênio', 'Nitrogênio', 'Gás carbônico', 'Hidrogênio'], correta: 2 },
        { id: 'q5', disc: 'Português', pergunta: 'Qual palavra está escrita corretamente?', opcoes: ['Exceção', 'Excessão', 'Eceção', 'Exessão'], correta: 0 },
        { id: 'q6', disc: 'Geografia', pergunta: 'Qual bioma ocupa a maior parte do interior da Bahia?', opcoes: ['Pampa', 'Caatinga', 'Pantanal', 'Floresta Amazônica'], correta: 1 },
        { id: 'q7', disc: 'Ciências', pergunta: 'Qual é o planeta mais próximo do Sol?', opcoes: ['Vênus', 'Terra', 'Mercúrio', 'Marte'], correta: 2 },
        { id: 'q8', disc: 'Cultura', pergunta: 'Qual instrumento é essencial na roda de capoeira?', opcoes: ['Berimbau', 'Violino', 'Gaita', 'Flauta doce'], correta: 0 },
        { id: 'q9', disc: 'Matemática', pergunta: 'Qual é a raiz quadrada de 144?', opcoes: ['10', '12', '14', '16'], correta: 1 },
        { id: 'q10', disc: 'História', pergunta: 'Quem foi Maria Quitéria, heroína da Independência na Bahia?', opcoes: ['Uma poetisa', 'Uma soldada que lutou pela independência', 'Uma rainha portuguesa', 'Uma cientista'], correta: 1 }
      ],
      memoria: [
        { id: 'm1', a: 'H₂O', b: 'Água' },
        { id: 'm2', a: 'CO₂', b: 'Gás carbônico' },
        { id: 'm3', a: 'π', b: '3,14' },
        { id: 'm4', a: 'Salvador', b: 'Capital da Bahia' },
        { id: 'm5', a: '2 de Julho', b: 'Independência da Bahia' },
        { id: 'm6', a: 'Berimbau', b: 'Capoeira' },
        { id: 'm7', a: 'Sol', b: 'Estrela' },
        { id: 'm8', a: 'Caatinga', b: 'Bioma' }
      ],
      forca: [
        { id: 'f1', palavra: 'PELOURINHO', dica: 'Centro histórico de Salvador', disc: 'Geografia' },
        { id: 'f2', palavra: 'FOTOSSINTESE', dica: 'Processo que as plantas usam para produzir alimento', disc: 'Ciências' },
        { id: 'f3', palavra: 'ACARAJE', dica: 'Comida típica baiana feita de feijão-fradinho', disc: 'Cultura' },
        { id: 'f4', palavra: 'TRIANGULO', dica: 'Figura geométrica com três lados', disc: 'Matemática' },
        { id: 'f5', palavra: 'SUBSTANTIVO', dica: 'Classe de palavras que nomeia seres', disc: 'Português' },
        { id: 'f6', palavra: 'CAPOEIRA', dica: 'Luta e dança de origem afro-brasileira', disc: 'Cultura' },
        { id: 'f7', palavra: 'DEMOCRACIA', dica: 'Regime em que o poder vem do povo', disc: 'História' }
      ],
      caca: [
        { id: 'k1', tema: 'Bahia', palavras: ['SALVADOR', 'ACARAJE', 'BERIMBAU', 'BONFIM', 'DENDE', 'CAPOEIRA'] },
        { id: 'k2', tema: 'Ciências', palavras: ['ATOMO', 'CELULA', 'ENERGIA', 'PLANETA', 'GRAVIDADE', 'MOLECULA'] },
        { id: 'k3', tema: 'Escola', palavras: ['CADERNO', 'PROFESSOR', 'LIVRO', 'AULA', 'PROVA', 'RECREIO'] }
      ]
    },
    salas: [
      { id: 's1', nome: '1º Ano A – Matemática', turma: '1º Ano A', disciplina: 'Matemática', professor: 'Prof. Carlos', dia: 'Seg e Qua', horario: '08:00', codigo: 'MAT1A', link: '', descricao: 'Funções, geometria e resolução de problemas.', cor: '#1747B8' },
      { id: 's2', nome: '2º Ano B – Português', turma: '2º Ano B', disciplina: 'Língua Portuguesa', professor: 'Profa. Luciana', dia: 'Ter e Qui', horario: '09:40', codigo: 'POR2B', link: '', descricao: 'Literatura, gramática e produção de texto.', cor: '#D7263D' },
      { id: 's3', nome: '3º Ano A – Ciências da Natureza', turma: '3º Ano A', disciplina: 'Biologia e Química', professor: 'Profa. Marta', dia: 'Sex', horario: '10:30', codigo: 'CIE3A', link: '', descricao: 'Revisão para o ENEM em ciências da natureza.', cor: '#1FA971' },
      { id: 's4', nome: '9º Ano – História e Geografia', turma: '9º Ano', disciplina: 'Humanas', professor: 'Prof. Jorge', dia: 'Seg e Sex', horario: '14:00', codigo: 'HUM9', link: '', descricao: 'Brasil, Bahia e mundo contemporâneo.', cor: '#FFB400' }
    ],
    salaAvisos: [
      { id: 'sa1', salaId: 's1', texto: 'Prova de funções na próxima quarta-feira. Revisem a lista 3.', data: '2026-11-22' },
      { id: 'sa2', salaId: 's2', texto: 'Entrega da redação: tema "Juventude e tecnologia" até sexta.', data: '2026-11-21' },
      { id: 'sa3', salaId: 's3', texto: 'Aulão de revisão no sábado, às 9h, na sala virtual.', data: '2026-11-23' },
      { id: 'sa4', salaId: 's4', texto: 'Tragam o mapa do Brasil para a aula de segunda.', data: '2026-11-20' }
    ],
    salaAtividades: [
      { id: 'at1', salaId: 's1', titulo: 'Lista de exercícios 3 – Funções', desc: 'Resolver os exercícios de 1 a 12.', prazo: '2026-11-27' },
      { id: 'at2', salaId: 's1', titulo: 'Desafio da semana', desc: 'Resolver o problema de otimização enviado em aula.', prazo: '2026-11-29' },
      { id: 'at3', salaId: 's2', titulo: 'Redação: Juventude e tecnologia', desc: 'Texto dissertativo-argumentativo de 25 a 30 linhas.', prazo: '2026-11-28' },
      { id: 'at4', salaId: 's3', titulo: 'Questões ENEM – Ecologia', desc: 'Responder o simulado de 10 questões.', prazo: '2026-11-30' },
      { id: 'at5', salaId: 's4', titulo: 'Mapa mental: Independência da Bahia', desc: 'Criar um mapa mental com datas e personagens.', prazo: '2026-12-01' }
    ],
    salaMateriais: [
      { id: 'sm1', salaId: 's1', titulo: 'Resumo de funções (PDF)', url: '#', tipo: 'PDF' },
      { id: 'sm2', salaId: 's2', titulo: 'Guia de redação ENEM', url: '#', tipo: 'PDF' },
      { id: 'sm3', salaId: 's3', titulo: 'Videoaula: Ecologia', url: 'https://www.youtube.com/', tipo: 'Vídeo' },
      { id: 'sm4', salaId: 's4', titulo: 'Linha do tempo da Bahia', url: '#', tipo: 'Link' }
    ],
    mensagens: [],
    admins: [
      /* usuário padrão: admin / admin123 — troque no painel (Usuários) */
      { id: 'u1', user: 'admin', nome: 'Administrador', hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' }
    ]
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* mescla padrões em objetos (arrays do usuário prevalecem) */
  function merge(def, cur) {
    if (Array.isArray(def)) return Array.isArray(cur) ? cur : clone(def);
    if (def && typeof def === 'object') {
      var out = {};
      var cobj = (cur && typeof cur === 'object' && !Array.isArray(cur)) ? cur : {};
      Object.keys(def).forEach(function (k) { out[k] = merge(def[k], cobj[k]); });
      Object.keys(cobj).forEach(function (k) { if (!(k in out)) out[k] = cobj[k]; });
      return out;
    }
    return (cur === undefined || cur === null) ? def : cur;
  }


  /* SHA-256 em JS puro (usado quando crypto.subtle não está disponível) */
  function sha256sync(str) {
    var utf8 = unescape(encodeURIComponent(str));
    var K = [], H = [], i, j, w = [];
    var isP = function (n) { for (var f = 2; f * f <= n; f++) if (n % f === 0) return false; return true; };
    var frac = function (x) { return ((x - Math.floor(x)) * 4294967296) | 0; };
    for (var c = 2, k = 0; k < 64; c++) if (isP(c)) { if (k < 8) H[k] = frac(Math.pow(c, 0.5)); K[k++] = frac(Math.pow(c, 1 / 3)); }
    var bytes = [];
    for (i = 0; i < utf8.length; i++) bytes.push(utf8.charCodeAt(i));
    var bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (bitLen >>> (i * 8)) & 255);
    var rr = function (v, n) { return (v >>> n) | (v << (32 - n)); };
    for (var off = 0; off < bytes.length; off += 64) {
      for (i = 0; i < 16; i++) w[i] = (bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) | (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3];
      for (i = 16; i < 64; i++) {
        var s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], cc = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (i = 0; i < 64; i++) {
        var S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25), ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[i] + w[i]) | 0;
        var S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22), mj = (a & b) ^ (a & cc) ^ (b & cc);
        var t2 = (S0 + mj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = cc; cc = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + cc) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map(function (x) { return ('00000000' + (x >>> 0).toString(16)).slice(-8); }).join('');
  }

  var cache = null;

  var Store = {
    defaults: function () { return clone(DEFAULTS); },
    get: function () {
      if (cache) return cache;
      var raw = null;
      try { raw = JSON.parse(localStorage.getItem(KEY)); } catch (e) { raw = null; }
      cache = merge(DEFAULTS, raw);
      return cache;
    },
    save: function (data) {
      cache = data || cache;
      try {
        localStorage.setItem(KEY, JSON.stringify(cache));
        return true;
      } catch (e) {
        alert('Não foi possível salvar: o armazenamento do navegador está cheio. Remova imagens grandes ou exporte um backup.');
        return false;
      }
    },
    reset: function () { cache = null; try { localStorage.removeItem(KEY); } catch (e) {} },
    reload: function () { cache = null; return Store.get(); },
    uid: function (p) { return (p || 'id') + Math.random().toString(36).slice(2, 9); },
    exportJSON: function () { return JSON.stringify(Store.get(), null, 2); },
    importJSON: function (txt) {
      var obj = JSON.parse(txt);
      cache = merge(DEFAULTS, obj);
      return Store.save(cache);
    },
    /* Carrega o arquivo publicado (assets/data/site-data.json) quando este navegador
       ainda não tem edições locais. Assim os visitantes veem o conteúdo publicado. */
    carregarPublicado: function (url) {
      var temLocal = false;
      try { temLocal = !!localStorage.getItem(KEY); } catch (e) {}
      if (temLocal || !global.fetch) return Promise.resolve(false);
      var tempo = new Promise(function (res) { setTimeout(function () { res(null); }, 2500); });
      var busca = fetch(url, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
      return Promise.race([busca, tempo]).then(function (obj) {
        if (obj && typeof obj === 'object') { cache = merge(DEFAULTS, obj); return true; }
        return false;
      });
    },
    sha256: function (text) {
      if (!(global.crypto && crypto.subtle)) return Promise.resolve(sha256sync(text));
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      });
    },
    KEY: KEY
  };

  global.Store = Store;
})(window);
