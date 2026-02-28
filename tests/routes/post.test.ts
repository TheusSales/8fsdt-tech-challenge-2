import request from 'supertest';
import express from 'express';
import postRoutes from '../../src/routes/post';
import { Post, IPost } from '../../src/models/post';

jest.mock('../../src/models/post');

const mockPost = Post as jest.Mocked<typeof Post>;

const app = express();
app.use(express.json());
app.use('/posts', postRoutes);

describe('Post Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /posts', () => {
    it('should return all posts', async () => {
      const mockPosts: IPost[] = [
        { idpost: 1, titulo: 'Test Post', conteudo: 'Content', autor: 'Author' }
      ];
      mockPost.findAll.mockResolvedValue(mockPosts);

      const response = await request(app).get('/posts');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPosts);
      expect(mockPost.findAll).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockPost.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/posts');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Erro interno no servidor ao buscar posts.');
    });
  });

  describe('GET /posts/search', () => {
    it('should return search results', async () => {
      const mockPosts: IPost[] = [
        { idpost: 1, titulo: 'Test Post', conteudo: 'Content', autor: 'Author' }
      ];
      mockPost.search.mockResolvedValue(mockPosts);

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
      const mockPostData: IPost = { idpost: 1, titulo: 'Test Post', conteudo: 'Content', autor: 'Author' };
      mockPost.findById.mockResolvedValue(mockPostData);

      const response = await request(app).get('/posts/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPostData);
    });

    it('should return 404 if post not found', async () => {
      mockPost.findById.mockResolvedValue(null);

      const response = await request(app).get('/posts/1');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Post não encontrado');
    });
  });

  describe('POST /posts', () => {
    it('should create a new post', async () => {
      const newPost: IPost = { titulo: 'New Post', conteudo: 'Content', autor: 'Author' };
      const createdPost: IPost = { idpost: 1, ...newPost };
      mockPost.create.mockResolvedValue(createdPost);

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
      const updateData: IPost = { titulo: 'Updated Post', conteudo: 'Updated Content', autor: 'Updated Author' };
      const updatedPost: IPost = { idpost: 1, ...updateData };
      mockPost.update.mockResolvedValue(updatedPost);

      const response = await request(app)
        .put('/posts/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Post atualizado com sucesso!');
      expect(response.body.post).toEqual(updatedPost);
    });

    it('should return 404 if post not found', async () => {
      mockPost.update.mockResolvedValue(null);

      const response = await request(app)
        .put('/posts/1')
        .send({ titulo: 'Updated', conteudo: 'Updated', autor: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Post não encontrado');
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete a post', async () => {
      mockPost.delete.mockResolvedValue(true);

      const response = await request(app).delete('/posts/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Post deletado com sucesso!');
    });

    it('should return 404 if post not found', async () => {
      mockPost.delete.mockResolvedValue(false);

      const response = await request(app).delete('/posts/1');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Post não encontrado para exclusão.');
    });
  });
});