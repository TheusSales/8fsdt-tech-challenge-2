import { Request, Response } from 'express';
import { mock, MockProxy } from 'jest-mock-extended';
import { pool } from '../../src/database';
import {
  getPosts,
  getPostById,
  getSearchPosts,
  createPost,
  updatePost,
  deletePost
} from '../../src/controllers/post';

// Mock the database pool
jest.mock('../../src/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const mockPool = pool as jest.Mocked<typeof pool>;

describe('Post Controller', () => {
  let mockRequest: MockProxy<Request>;
  let mockResponse: MockProxy<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockRequest = mock<Request>();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = mock<Response>();
    mockResponse.json = mockJson;
    mockResponse.status = mockStatus;

    jest.clearAllMocks();
  });

  describe('getPosts', () => {
    it('should return all posts successfully', async () => {
      const mockPosts = [
        { idPost: 1, titulo: 'Test Post', conteudo: 'Content', autor: 'Author' }
      ];
      mockPool.query.mockResolvedValue({ rows: mockPosts });

      await getPosts(mockRequest, mockResponse);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM posts');
      expect(mockResponse.json).toHaveBeenCalledWith(mockPosts);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPool.query.mockRejectedValue(error);

      await getPosts(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Erro interno no servidor ao buscar posts.' });
    });
  });

  describe('getPostById', () => {
    it('should return a post by id successfully', async () => {
      const mockPost = { idPost: 1, titulo: 'Test Post', conteudo: 'Content', autor: 'Author' };
      mockRequest.params = { id: '1' };
      mockPool.query.mockResolvedValue({ rows: [mockPost], rowCount: 1 });

      await getPostById(mockRequest, mockResponse);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM posts WHERE idPost = $1', [1]);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPost);
    });

    it('should return 404 if post not found', async () => {
      mockRequest.params = { id: '1' };
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await getPostById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Post não encontrado' });
    });

    it('should handle invalid id parameter', async () => {
      mockRequest.params = { id: 'invalid' };
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await getPostById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getSearchPosts', () => {
    it('should return search results successfully', async () => {
      const mockPosts = [
        { idPost: 1, titulo: 'Test Post', conteudo: 'Content', autor: 'Author' }
      ];
      mockRequest.query = { q: 'test' };
      mockPool.query.mockResolvedValue({ rows: mockPosts, rowCount: 1 });

      await getSearchPosts(mockRequest, mockResponse);

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM posts WHERE LOWER(titulo) LIKE LOWER($1) OR LOWER(conteudo) LIKE LOWER($1)',
        ['%test%']
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockPosts);
    });

    it('should return 400 if no search query provided', async () => {
      mockRequest.query = {};

      await getSearchPosts(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Por favor, informe um termo de busca válido.' });
    });

    it('should return 404 if no posts found', async () => {
      mockRequest.query = { q: 'nonexistent' };
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await getSearchPosts(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Nenhum post encontrado para este termo.' });
    });
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const mockPost = { idPost: 1, titulo: 'New Post', conteudo: 'Content', autor: 'Author' };
      mockRequest.body = { titulo: 'New Post', conteudo: 'Content', autor: 'Author' };
      mockPool.query.mockResolvedValue({ rows: [mockPost] });

      await createPost(mockRequest, mockResponse);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO posts'),
        ['New Post', 'Content', 'Author']
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Post criado com sucesso! 🚀',
        post: mockPost
      });
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = { titulo: 'New Post' };

      await createPost(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Título, conteúdo e autor são obrigatórios.' });
    });
  });

  describe('updatePost', () => {
    it('should update a post successfully', async () => {
      const mockPost = { idPost: 1, titulo: 'Updated Post', conteudo: 'Updated Content', autor: 'Updated Author' };
      mockRequest.params = { id: '1' };
      mockRequest.body = { titulo: 'Updated Post', conteudo: 'Updated Content', autor: 'Updated Author' };
      mockPool.query.mockResolvedValue({ rows: [mockPost], rowCount: 1 });

      await updatePost(mockRequest, mockResponse);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE posts'),
        ['Updated Post', 'Updated Content', 'Updated Author', 1]
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Post atualizado com sucesso!',
        post: mockPost
      });
    });

    it('should return 404 if post not found', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { titulo: 'Updated Post', conteudo: 'Updated Content', autor: 'Updated Author' };
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await updatePost(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Post não encontrado' });
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      mockRequest.params = { id: '1' };
      mockPool.query.mockResolvedValue({ rowCount: 1 });

      await deletePost(mockRequest, mockResponse);

      expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM posts WHERE idPost = $1', [1]);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Post deletado com sucesso!' });
    });

    it('should return 404 if post not found', async () => {
      mockRequest.params = { id: '1' };
      mockPool.query.mockResolvedValue({ rowCount: 0 });

      await deletePost(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Post não encontrado para exclusão.' });
    });
  });
});