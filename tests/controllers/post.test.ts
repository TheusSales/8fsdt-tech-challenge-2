import { Request, Response } from 'express';
import { mock, MockProxy } from 'jest-mock-extended';
import { Post, IPost } from '../../src/models/post';
import {
  getPosts,
  getPostById,
  getSearchPosts,
  createPost,
  updatePost,
  deletePost
} from '../../src/controllers/post';

jest.mock('../../src/models/post');

const mockPost = Post as jest.Mocked<typeof Post>;

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
      const mockPosts: IPost[] = [
        { idpost: 1, titulo: 'Test Post', conteudo: 'Content', autor: 'Author' }
      ];
      mockPost.findAll.mockResolvedValue(mockPosts);

      await getPosts(mockRequest, mockResponse);

      expect(mockPost.findAll).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockPosts);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockPost.findAll.mockRejectedValue(error);

      await getPosts(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Erro interno no servidor ao buscar posts.' });
    });
  });

  describe('getPostById', () => {
    it('should return a post by id successfully', async () => {
      const mockPostData: IPost = { idpost: 1, titulo: 'Test Post', conteudo: 'Content', autor: 'Author' };
      mockRequest.params = { id: '1' };
      mockPost.findById.mockResolvedValue(mockPostData);

      await getPostById(mockRequest, mockResponse);

      expect(mockPost.findById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPostData);
    });

    it('should return 404 if post not found', async () => {
      mockRequest.params = { id: '1' };
      mockPost.findById.mockResolvedValue(null);

      await getPostById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Post não encontrado' });
    });
  });

  describe('getSearchPosts', () => {
    it('should return search results successfully', async () => {
      const mockPosts: IPost[] = [
        { idpost: 1, titulo: 'Test Post', conteudo: 'Content', autor: 'Author' }
      ];
      mockRequest.query = { q: 'test' };
      mockPost.search.mockResolvedValue(mockPosts);

      await getSearchPosts(mockRequest, mockResponse);

      expect(mockPost.search).toHaveBeenCalledWith('test');
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
        mockPost.search.mockResolvedValue([]);
      
        await getSearchPosts(mockRequest, mockResponse);
      
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({ message: 'Nenhum post encontrado para este termo.' });
      });
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const newPost: IPost = { titulo: 'New Post', conteudo: 'Content', autor: 'Author' };
      const createdPost: IPost = { idpost: 1, ...newPost };
      mockRequest.body = newPost;
      mockPost.create.mockResolvedValue(createdPost);

      await createPost(mockRequest, mockResponse);

      expect(mockPost.create).toHaveBeenCalledWith(newPost);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Post criado com sucesso! 🚀',
        post: createdPost
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
      const updateData: IPost = { titulo: 'Updated Post', conteudo: 'Updated Content', autor: 'Updated Author' };
      const updatedPost: IPost = { idpost: 1, ...updateData };
      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockPost.update.mockResolvedValue(updatedPost);

      await updatePost(mockRequest, mockResponse);

      expect(mockPost.update).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Post atualizado com sucesso!',
        post: updatedPost
      });
    });

    it('should return 404 if post not found', async () => {
      mockRequest.params = { id: '1' };
      const updateData: IPost = { titulo: 'Updated Post', conteudo: 'Updated Content', autor: 'Updated Author' };
      mockRequest.body = updateData;
      mockPost.update.mockResolvedValue(null);

      await updatePost(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Post não encontrado' });
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      mockRequest.params = { id: '1' };
      mockPost.delete.mockResolvedValue(true);

      await deletePost(mockRequest, mockResponse);

      expect(mockPost.delete).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Post deletado com sucesso!' });
    });

    it('should return 404 if post not found', async () => {
      mockRequest.params = { id: '1' };
      mockPost.delete.mockResolvedValue(false);

      await deletePost(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Post não encontrado para exclusão.' });
    });
  });
});