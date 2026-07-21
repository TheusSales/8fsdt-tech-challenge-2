import { pool } from '../database';
import { hashPassword } from '../utils/password';

// Popula o banco com dados mínimos para desenvolvimento e demo.
// Idempotente: pode rodar quantas vezes quiser (npm run seed).

const DEFAULT_PROFESSOR = {
  name: 'Administrador FIAP',
  email: 'admin@fiap.com',
  password: 'admin123',
};

const STUDENTS = [
  { name: 'Ana Souza', email: 'ana.souza@aluno.fiap.com', ra: '2024001' },
  { name: 'Bruno Lima', email: 'bruno.lima@aluno.fiap.com', ra: '2024002' },
];

const POSTS = [
  {
    titulo: 'Bem-vindo ao blog da turma',
    conteudo:
      'Este é o primeiro post da nossa plataforma. Aqui os professores publicam materiais e avisos para os alunos.',
    autor: 'Administrador FIAP',
  },
  {
    titulo: 'Como estudar React Native',
    conteudo:
      'Comece pelos componentes básicos, entenda o ciclo de vida e só depois parta para navegação e estado global.',
    autor: 'Administrador FIAP',
  },
];

const seed = async () => {
  const passwordHash = await hashPassword(DEFAULT_PROFESSOR.password);

  await pool.query(
    `INSERT INTO professors (name, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO NOTHING`,
    [DEFAULT_PROFESSOR.name, DEFAULT_PROFESSOR.email, passwordHash]
  );

  for (const student of STUDENTS) {
    await pool.query(
      `INSERT INTO students (name, email, ra)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
      [student.name, student.email, student.ra]
    );
  }

  // posts não tem coluna única, então o guard é pelo título.
  for (const post of POSTS) {
    await pool.query(
      `INSERT INTO posts (titulo, conteudo, autor)
       SELECT $1, $2, $3
       WHERE NOT EXISTS (SELECT 1 FROM posts WHERE titulo = $1)`,
      [post.titulo, post.conteudo, post.autor]
    );
  }

  console.log('Seed concluído.');
  console.log(`Login: ${DEFAULT_PROFESSOR.email} / ${DEFAULT_PROFESSOR.password}`);
};

seed()
  .catch((error) => {
    console.error('Erro ao executar o seed:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
