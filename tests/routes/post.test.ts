import request from 'supertest';
import express from 'express';
import postRoutes from '../../src/routes/post';

// Mock the database pool
jest.mock('../../src/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

import { pool } from '../../src/database';

const mockPool = pool as jest.Mocked<typeof pool>;

const app = express();
app.use(express.json());
app.use('/posts', postRoutes);

describe('Post Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /posts', () => {
    it('should return all posts', async () => {
      const mockPosts = [
        { idPost: 1, titulo: 'Test Post', conteudo: 'Content', autor: 'Author' }
      ];
      mockPool.query.mockResolvedValue({ rows: mockPosts });

      const response = await request(app).get('/posts');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPosts);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM posts');
    });

    it('should handle database errors', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/posts');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Erro interno no servidor ao buscar posts.');
    });
  });

  describe('GET /posts/search', () => {
    it('should return search results', async () => {
      const mockPosts = [
        { idPost: 1, titulo: 'Test Post', conteudo: 'Content', autor: 'Author' }
      ];
      mockPool.query.mockResolvedValue({ rows: mockPosts, rowCount: 1 });

      const response = await request(app).get('/posts/search?q=test');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPosts);
    });

    it('should return 400 if no search query', async () => {
      const response = await request(app).get('/posts/search');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Por favor, informe um termo de busca válido.');
    });
  });

  describe('GET /posts/:id', () => {
    it('should return a post by id', async () => {
      const mockPost = { idPost: 1, titulo: 'Test Post', conteudo: 'Content', autor: 'Author' };
      mockPool.query.mockResolvedValue({ rows: [mockPost], rowCount: 1 });

      const response = await request(app).get('/posts/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPost);
    });

    it('should return 404 if post not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const response = await request(app).get('/posts/1');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Post não encontrado');
    });
  });

  describe('POST /posts', () => {
    it('should create a new post', async () => {
      const newPost = { titulo: 'New Post', conteudo: 'Content', autor: 'Author' };
      const createdPost = { idPost: 1, ...newPost };
      mockPool.query.mockResolvedValue({ rows: [createdPost] });

      const response = await request(app)
        .post('/posts')
        .send(newPost);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Post criado com sucesso! 🚀');
      expect(response.body.post).toEqual(createdPost);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/posts')
        .send({ titulo: 'New Post' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Título, conteúdo e autor são obrigatórios.');
    });
  });

  describe('PUT /posts/:id', () => {
    it('should update a post', async () => {
      const updateData = { titulo: 'Updated Post', conteudo: 'Updated Content', autor: 'Updated Author' };
      const updatedPost = { idPost: 1, ...updateData };
      mockPool.query.mockResolvedValue({ rows: [updatedPost], rowCount: 1 });

      const response = await request(app)
        .put('/posts/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Post atualizado com sucesso!');
      expect(response.body.post).toEqual(updatedPost);
    });

    it('should return 404 if post not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const response = await request(app)
        .put('/posts/1')
        .send({ titulo: 'Updated', conteudo: 'Updated', autor: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Post não encontrado');
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete a post', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 1 });

      const response = await request(app).delete('/posts/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Post deletado com sucesso!');
    });

    it('should return 404 if post not found', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 0 });

      const response = await request(app).delete('/posts/1');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Post não encontrado para exclusão.');
    });
  });
});