# Tech Challenge Fase 2 - API de Blog

Esta é uma API RESTful para gerenciamento de postagens de blog, desenvolvida como requisito do Tech Challenge da Fase 2 da Pós Graduação de FullStack Development.

## Arquitetura da Aplicação
A aplicação foi construída visando performance, escalabilidade e boas práticas:
- **Linguagem/Framework:** Node.js com Express e TypeScript.
- **Banco de Dados:** PostgreSQL (Relacional), garantindo integridade dos dados.
- **Infraestrutura:** Docker e Docker Compose para conteinerização do banco de dados, facilitando a execução em qualquer ambiente.
- **Qualidade e Automação:** Testes unitários implementados com Jest e pipeline de CI/CD configurado via GitHub Actions.

---

## Setup Inicial (Como rodar o projeto)

### Pré-requisitos
- Node.js (v18 ou superior)
- Docker e Docker Desktop instalados

### Passo a Passo

1. Clone o repositório:
`git clone https://github.com/TheusSales/8fsdt-tech-challenge-2`

2. Acesse a pasta do projeto e instale as dependências:
`npm install`

3. Suba o banco de dados PostgreSQL usando o Docker:
`docker-compose up -d`

4. Inicie o servidor em modo de desenvolvimento:
`npm run dev`

A API estará disponível em: `http://localhost:3000`

---

## Guia de Uso das APIs (Endpoints)

Abaixo estão as rotas disponíveis na aplicação. Todas retornam os dados no formato JSON.

### Postagens

- **GET /posts**: Lista todas as postagens criadas.

- **GET /posts/:id**: Retorna os detalhes de uma postagem específica através do ID.

- **POST /posts**: Cria uma nova postagem.
  - Body esperado: `{ "titulo": "string", "conteudo": "string", "autor": "string" }`

- **PUT /posts/:id**: Edita uma postagem existente.
  - Body esperado: `{ "titulo": "string", "conteudo": "string", "autor": "string" }`

- **DELETE /posts/:id**: Exclui uma postagem específica através do ID.

- **GET /posts/search?q=termo**: Busca postagens por palavras-chave. Retorna os posts que contêm o termo pesquisado no título ou no conteúdo.

---

## Testes e CI/CD

O projeto conta com testes automatizados para garantir a estabilidade das operações principais (CRUD). Para rodar os testes localmente, execute na raiz do projeto:

`npm test`


O reposiro possui um fluxo de Continuous Integration (CI) configurado. A cada push para a branch principal, o GitHub Actions executa automaticamente a suíte de testes, garantindo a qualidade do código entregue.

