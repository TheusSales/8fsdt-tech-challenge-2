# Tech Challenge Fase 2 - API de Blog

Esta é uma API RESTful para gerenciamento de postagens de blog, desenvolvida como requisito da Fase 2 do Tech Challenge.

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

3. Suba o banco de dados PostgreSQL isolado via Docker:
`docker-compose up -d`

4. Inicie o servidor Node.js em modo de desenvolvimento:
`npm run dev`

A API estará rodando e pronta para receber requisições em: `http://localhost:3000`

---

##  Guia de Uso da Aplicação (APIs)

Abaixo estão os endpoints disponíveis. Todas as respostas e requisições utilizam o formato JSON.

### Postagens (Posts)

- **GET /posts**: Lista todas as postagens criadas na plataforma.
- **GET /posts/:id**: Retorna o conteúdo completo e os detalhes de uma postagem específica através do seu ID.
- **POST /posts**: Cria uma nova postagem.
  - Body esperado: `{ "titulo": "string", "conteudo": "string", "autor": "string" }`
- **PUT /posts/:id**: Edita uma postagem existente identificada pelo ID.
  - Body esperado: `{ "titulo": "string", "conteudo": "string", "autor": "string" }`
- **DELETE /posts/:id**: Exclui permanentemente uma postagem específica através do ID.
- **GET /posts/search?q=termo**: Realiza a busca de posts por palavras-chave. Retorna uma lista de postagens que contêm o termo pesquisado no título ou no conteúdo de forma *case-insensitive*.

---

##  Cobertura de Testes e CI/CD

O projeto conta com mais de 20% de cobertura de testes unitários focados nas operações críticas do sistema (criação, edição e exclusão de postagens). Para rodar os testes localmente, execute o comando na raiz do projeto:

`npm test`

**Automação:** O repositório possui um workflow de **Continuous Integration (CI)** configurado via GitHub Actions. A cada *push* realizado para a branch principal, um servidor remoto clona o código, instala as dependências e executa automaticamente a suíte de testes (`npm test`), validando a integridade da aplicação antes de qualquer deploy.

---

##  Relato de Experiências e Desafios

Durante o desenvolvimento desta Fase 2, enfrentamos desafios técnicos valiosos que contribuíram significativamente para a evolução do projeto e do aprendizado prático:

1. **Configuração do Ambiente de Banco de Dados:** O desafio inicial foi a configuração do PostgreSQL. Tivemos dificuldades locais com questões de autenticação (*Peer Authentication*) e conflitos de instalação variando entre sistemas operacionais (Linux vs Windows). A solução encontrada e adotada foi o uso do **Docker**, que não apenas resolveu o problema de incompatibilidade instantaneamente através do `docker-compose`, mas também elevou a maturidade da infraestrutura do projeto.
   
2. **Refatoração para Persistência Real:** Migrar a estrutura inicial (que utilizava arrays em memória) para comandos assíncronos em SQL exigiu cuidado extra. O desafio foi garantir que operações como `UPDATE` e `DELETE` trouxessem retornos corretos para a API (usando a cláusula `RETURNING *` do Postgres) e tratassem cenários em que o ID solicitado não existisse no banco, retornando corretamente o *Status 404 (Not Found)*.

3. **Resolução de Conflitos de Módulos e Importações:** Outro obstáculo superado envolveu a configuração do TypeScript (`tsconfig.json`). Enfrentamos erros de compilação relacionados à resolução de módulos e importações de arquivos. Quando corrigimos o comportamento para a aplicação rodar perfeitamente no servidor via `ts-node-dev`, o problema ressurgiu ao tentar executar os testes unitários, já que o Jest utiliza um ambiente de execução próprio. A solução exigiu um aprofundamento na configuração do `ts-jest` e no alinhamento das opções de interoperabilidade de módulos, garantindo que a suíte de testes e a API compreendessem a mesma sintaxe de importação.

4. **Implementação de Testes Unitários e CI/CD:** Atingir a meta de cobertura de testes exigiu o entendimento de como isolar o banco de dados das funções do *Controller* utilizando Mocks no Jest. Superada essa etapa, o desafio final foi escrever o arquivo `.yml` do GitHub Actions, compreendendo os passos (steps) necessários para fazer a máquina do GitHub replicar perfeitamente o nosso ambiente local de desenvolvimento. Ver o pipeline rodando e aprovando os testes automaticamente foi a maior recompensa desta fase.

