-- Schema completo do blog (idempotente).
-- Uso: psql -h localhost -U postgres -d blog_tech -f src/scripts/schema.sql

-- Espelha a tabela que já existe no banco de desenvolvimento.
CREATE TABLE IF NOT EXISTS posts (
  idPost SERIAL PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  conteudo TEXT NOT NULL,
  autor VARCHAR(100) NOT NULL,
  dataCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS professors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  ra VARCHAR(40),
  created_at TIMESTAMP DEFAULT NOW()
);
