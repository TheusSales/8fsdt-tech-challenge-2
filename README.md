# Tech Challenge Fase 2 - API de Blog

Esta é uma API RESTful para gerenciamento de postagens de blog, desenvolvida como requisito da Fase 2 do Tech Challenge.

> **Extensão da Fase 4:** esta API foi ampliada para atender o app mobile em React Native ([TheusSales/tech-challenge-4](https://github.com/TheusSales/tech-challenge-4)). Foram adicionados autenticação JWT de professores, CRUD de professores e de alunos, paginação e proteção das rotas de escrita de posts. A leitura de posts permanece pública, para que alunos naveguem sem login.

## Arquitetura do Sistema

A arquitetura foi projetada para ser modular, escalável e de fácil manutenção, seguindo princípios de separação de responsabilidades (Controllers, Routes e Database):
- **Back-end:** Node.js utilizando o framework Express para roteamento e middlewares.
- **Linguagem:** TypeScript, garantindo tipagem estática e maior segurança no desenvolvimento.
- **Banco de Dados:** PostgreSQL (Relacional), responsável por garantir a persistência e integridade dos dados (como a validação do formato das postagens). Comunicação feita via `pg` (node-postgres) com *Prepared Statements* para evitar injeção de SQL.
- **Infraestrutura e Deploy:** A aplicação utiliza Docker e Docker Compose para a conteinerização do banco de dados, isolando o ambiente e garantindo que o software funcione de maneira idêntica em qualquer máquina.
- **Qualidade e Integração Contínua:** Utilização do Jest para testes unitários e GitHub Actions (CI/CD) para automatizar a execução da suíte de testes a cada novo push, garantindo a confiabilidade das entregas.

---

## Setup Inicial (Como rodar o projeto)

### Pré-requisitos
- Node.js (v18 ou superior)
- Docker e Docker Desktop ativados na máquina

### Passo a Passo

1. Clone o repositório:
`git clone https://github.com/TheusSales/8fsdt-tech-challenge-2`

2. Acesse a pasta do projeto e instale as dependências:
`npm install`

3. Crie o arquivo `.env` a partir do modelo e ajuste os valores:
`cp .env.example .env`

   > O `JWT_SECRET` é obrigatório: sem ele o login de professores falha ao assinar o token.

4. Suba o banco de dados PostgreSQL isolado via Docker:
`docker-compose up -d`

5. Crie as tabelas (idempotente, pode rodar novamente sem perder dados):
`docker exec -i postgres_blog psql -U postgres -d blog_tech < src/scripts/schema.sql`

6. Popule os dados iniciais (também idempotente):
`npm run seed`

   Isso cria o professor padrão **`admin@fiap.com` / `admin123`**, dois alunos e dois posts de exemplo.

7. Inicie o servidor Node.js em modo de desenvolvimento:
`npm run dev`

A API estará rodando e pronta para receber requisições em: `http://localhost:3000`

---

##  Guia de Uso da Aplicação (APIs)

Abaixo estão os endpoints disponíveis. Todas as respostas e requisições utilizam o formato JSON.

Rotas marcadas com 🔒 exigem o header `Authorization: Bearer <token>`, obtido em `POST /auth/login`. Sem o header elas respondem **401**.

### Autenticação (Auth)

Adicionado na Fase 4 para suportar o app mobile. Apenas professores autenticam; alunos consomem os posts anonimamente.

- **POST /auth/login**: Autentica um professor e devolve o token JWT (validade de 8h).
  - Body esperado: `{ "email": "string", "password": "string" }`
  - Resposta: `{ "token": "...", "professor": { "id", "name", "email" } }`
  - Credenciais inválidas retornam **401** com a mesma mensagem para e-mail inexistente e senha errada, para não revelar quais e-mails estão cadastrados.
- 🔒 **GET /auth/me**: Retorna o professor dono do token. Útil para validar na inicialização do app se o token guardado ainda vale.

### Postagens (Posts)

- **GET /posts**: Lista todas as postagens criadas na plataforma. *(público)*
- **GET /posts/:id**: Retorna o conteúdo completo e os detalhes de uma postagem específica através do seu ID. *(público)*
- **GET /posts/search?q=termo**: Realiza a busca de posts por palavras-chave. Retorna uma lista de postagens que contêm o termo pesquisado no título ou no conteúdo de forma *case-insensitive*. *(público)*
- 🔒 **GET /posts/admin?page=1&pageSize=20**: Listagem paginada para a tela administrativa, ordenada da postagem mais recente para a mais antiga.
  - Resposta: `{ "items": [...], "page": 1, "pageSize": 20, "total": 42 }`
- 🔒 **POST /posts**: Cria uma nova postagem.
  - Body esperado: `{ "titulo": "string", "conteudo": "string", "autor": "string" }`
- 🔒 **PUT /posts/:id**: Edita uma postagem existente identificada pelo ID.
  - Body esperado: `{ "titulo": "string", "conteudo": "string", "autor": "string" }`
- 🔒 **DELETE /posts/:id**: Exclui permanentemente uma postagem específica através do ID.

### Professores (Professors)

Todas as rotas exigem autenticação. A senha nunca é devolvida em nenhuma resposta.

- 🔒 **GET /professors?page=1&pageSize=20**: Lista paginada, no mesmo envelope de `/posts/admin`.
- 🔒 **GET /professors/:id**: Detalhe de um professor.
- 🔒 **POST /professors**: Cadastra um professor (é assim que se cria um novo login; não existe rota pública de registro).
  - Body esperado: `{ "name": "string", "email": "string", "password": "string" }`
  - E-mail já cadastrado retorna **409**.
- 🔒 **PUT /professors/:id**: Edita um professor.
  - Body esperado: `{ "name": "string", "email": "string", "password": "string (opcional)" }`
  - Omitir `password` mantém a senha atual.
- 🔒 **DELETE /professors/:id**: Exclui um professor. Tentar excluir a si mesmo retorna **409**, para não deixar o sistema sem acesso.

### Alunos (Students)

Mesma estrutura dos professores, porém sem senha — alunos não fazem login, são apenas cadastros administrados pelos professores.

- 🔒 **GET /students?page=1&pageSize=20**: Lista paginada.
- 🔒 **GET /students/:id**: Detalhe de um aluno.
- 🔒 **POST /students**: Cadastra um aluno.
  - Body esperado: `{ "name": "string", "email": "string", "ra": "string (opcional)" }`
- 🔒 **PUT /students/:id**: Edita um aluno.
- 🔒 **DELETE /students/:id**: Exclui um aluno.

---

##  Cobertura de Testes e CI/CD

O projeto conta com **77 testes unitários** cobrindo as operações críticas do sistema: CRUD de postagens, autenticação (login, `/auth/me` e o middleware `requireAuth`), CRUD de professores e de alunos, além da paginação e do bloqueio das rotas protegidas. Para rodar os testes localmente, execute o comando na raiz do projeto:

`npm test`

Os testes mockam a camada de models, então não exigem banco de dados — rodam da mesma forma no CI. Em contrapartida, eles **não** validam o SQL de verdade; mudanças em queries devem ser conferidas com o Postgres rodando.

**Automação:** O repositório possui um workflow de **Continuous Integration (CI)** configurado via GitHub Actions. A cada *push* realizado para a branch principal, um servidor remoto clona o código, instala as dependências e executa automaticamente a suíte de testes (`npm test`), validando a integridade da aplicação antes de qualquer deploy.

---

##  Relato de Experiências e Desafios

Durante o desenvolvimento desta Fase 2, enfrentamos desafios técnicos valiosos que contribuíram significativamente para a evolução do projeto e do aprendizado prático:

1. **Configuração do Ambiente de Banco de Dados:** O desafio inicial foi a configuração do PostgreSQL. Tivemos dificuldades locais com questões de autenticação (*Peer Authentication*) e conflitos de instalação variando entre sistemas operacionais (Linux vs Windows). A solução encontrada e adotada foi o uso do **Docker**, que não apenas resolveu o problema de incompatibilidade instantaneamente através do `docker-compose`, mas também elevou a maturidade da infraestrutura do projeto.
   
2. **Refatoração para Persistência Real:** Migrar a estrutura inicial (que utilizava arrays em memória) para comandos assíncronos em SQL exigiu cuidado extra. O desafio foi garantir que operações como `UPDATE` e `DELETE` trouxessem retornos corretos para a API (usando a cláusula `RETURNING *` do Postgres) e tratassem cenários em que o ID solicitado não existisse no banco, retornando corretamente o *Status 404 (Not Found)*.

3. **Resolução de Conflitos de Módulos e Importações:** Outro obstáculo superado envolveu a configuração do TypeScript (`tsconfig.json`). Enfrentamos erros de compilação relacionados à resolução de módulos e importações de arquivos. Quando corrigimos o comportamento para a aplicação rodar perfeitamente no servidor via `ts-node-dev`, o problema ressurgiu ao tentar executar os testes unitários, já que o Jest utiliza um ambiente de execução próprio. A solução exigiu um aprofundamento na configuração do `ts-jest` e no alinhamento das opções de interoperabilidade de módulos, garantindo que a suíte de testes e a API compreendessem a mesma sintaxe de importação.

4. **Implementação de Testes Unitários e CI/CD:** Atingir a meta de cobertura de testes exigiu o entendimento de como isolar o banco de dados das funções do *Controller* utilizando Mocks no Jest. Superada essa etapa, o desafio final foi escrever o arquivo `.yml` do GitHub Actions, compreendendo os passos (steps) necessários para fazer a máquina do GitHub replicar perfeitamente o nosso ambiente local de desenvolvimento. Ver o pipeline rodando e aprovando os testes automaticamente foi a maior recompensa desta fase.

