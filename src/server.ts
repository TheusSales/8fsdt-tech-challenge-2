import express from 'express';
import postRoutes from './routes/post';

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/posts', postRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Servidor Tech Challenge rodando com sucesso!');
});

app.listen(PORT, () => {
  console.log(`✅ Servidor ativo em http://localhost:${PORT}`);
});