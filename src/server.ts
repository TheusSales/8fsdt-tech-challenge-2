import express from 'express';
import cors from 'cors';
import postRoutes from './routes/post';
import authRoutes from './routes/auth';
import professorRoutes from './routes/professor';
import studentRoutes from './routes/student';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/posts', postRoutes);
app.use('/auth', authRoutes);
app.use('/professors', professorRoutes);
app.use('/students', studentRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Servidor Tech Challenge rodando com sucesso!');
});

// Export the app for testing
module.exports = app;

// Only start listening if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Servidor ativo em http://localhost:${PORT}`);
  });
}