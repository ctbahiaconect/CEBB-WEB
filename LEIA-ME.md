# Site do Colégio Estadual Barros Barreto

Site completo (público + painel administrativo) em HTML, CSS e JavaScript puro.
Não precisa instalar nada: abra `index.html` no navegador ou publique a pasta em qualquer hospedagem estática.

## Estrutura
- `index.html` — site público
- `admin/index.html` — painel administrativo (separado do site)
- `assets/css`, `assets/js` — estilos e código
- `assets/data/site-data.json` — conteúdo publicado (gerado pelo painel)

## Site público
Início, A escola, Ensino, Notícias (busca e filtros), Agenda (calendário), Galeria (lightbox),
Contato, **Jogos didáticos** (Quiz, Memória, Forca, Matemática Relâmpago, Caça-palavras, com ranking)
e **Salas de aula virtuais** (videoaula, mural, atividades, materiais, chat, presença).
Responsivo para celular, tablet e desktop, com animações e respeito a "reduzir movimento".

## Painel administrativo
Endereço: `admin/index.html` (link também no rodapé do site).
**Primeiro acesso:** usuário `admin` · senha `admin123` — **troque em Usuários logo após entrar.**
Permite editar: configurações e contatos, cores/paletas, ativar/desativar seções, textos da página inicial e da escola,
notícias, ensino, agenda, galeria (com upload), equipe, depoimentos, jogos (perguntas, pares, palavras, temas),
salas virtuais (salas, avisos, atividades, materiais), mensagens e usuários.

## Como publicar as alterações (importante)
O painel salva no navegador de quem edita (sem servidor). Para todos os visitantes verem:
1. Painel → **Backup e publicação** → *Baixar arquivo de publicação*.
2. Envie o arquivo para `assets/data/site-data.json` na hospedagem (substitui o anterior).

## Limites desta versão (sem servidor)
- A senha do painel é uma barreira de uso, **não** segurança forte: qualquer pessoa com acesso técnico ao navegador/arquivos
  pode contorná-la. Para uso real com dados sensíveis, é preciso um backend com login de verdade.
- Chat, presença, entregas de atividades e ranking dos jogos ficam no navegador de cada pessoa
  (sincronizam entre abas do mesmo navegador, não entre computadores diferentes).
- A videoaula usa Jitsi Meet (meet.jit.si), que funciona entre dispositivos, mas exige internet.
- O formulário de contato abre e-mail/WhatsApp já preenchidos para a escola.
- Fontes vêm do Google Fonts; sem internet o site usa fontes do sistema.
