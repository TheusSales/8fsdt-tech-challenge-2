import { Pool } from 'pg';
import 'dotenv/config'; // Isso carrega o .env automaticamente

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT), // Convertendo string para número
});

// Teste de conexão simples
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar no banco!', err);
  } else {
    console.log('Banco de dados conectado com sucesso!');
  }
});