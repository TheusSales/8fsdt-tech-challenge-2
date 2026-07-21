import { Request, Response } from 'express';
import { mock, MockProxy } from 'jest-mock-extended';
import { Professor, IProfessor } from '../../src/models/professor';
import {
  getProfessors,
  getProfessorById,
  createProfessor,
  updateProfessor,
  deleteProfessor
} from '../../src/controllers/professor';
import { comparePassword } from '../../src/utils/password';

jest.mock('../../src/models/professor');

const mockProfessor = Professor as jest.Mocked<typeof Professor>;

// Simula o erro de UNIQUE que o pg lança em e-mail duplicado.
const uniqueViolation = () => Object.assign(new Error('duplicate key'), { code: '23505' });

describe('Professor Controller', () => {
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

  describe('getProfessors', () => {
    it('should return a paginated envelope', async () => {
      const items: IProfessor[] = [{ id: 1, name: 'Ana', email: 'ana@fiap.com' }];
      mockRequest.query = { page: '2', pageSize: '10' };
      mockProfessor.findAll.mockResolvedValue(items);
      mockProfessor.count.mockResolvedValue(15);

      await getProfessors(mockRequest, mockResponse);

      expect(mockProfessor.findAll).toHaveBeenCalledWith(10, 10);
      expect(mockJson).toHaveBeenCalledWith({ items, page: 2, pageSize: 10, total: 15 });
    });

    it('should fall back to defaults when pagination params are absent', async () => {
      mockRequest.query = {};
      mockProfessor.findAll.mockResolvedValue([]);
      mockProfessor.count.mockResolvedValue(0);

      await getProfessors(mockRequest, mockResponse);

      expect(mockProfessor.findAll).toHaveBeenCalledWith(20, 0);
      expect(mockJson).toHaveBeenCalledWith({ items: [], page: 1, pageSize: 20, total: 0 });
    });

    it('should handle errors', async () => {
      mockRequest.query = {};
      mockProfessor.findAll.mockRejectedValue(new Error('Database error'));
      mockProfessor.count.mockResolvedValue(0);

      await getProfessors(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(500);
    });
  });

  describe('getProfessorById', () => {
    it('should return the professor', async () => {
      const professor: IProfessor = { id: 1, name: 'Ana', email: 'ana@fiap.com' };
      mockRequest.params = { id: '1' };
      mockProfessor.findById.mockResolvedValue(professor);

      await getProfessorById(mockRequest, mockResponse);

      expect(mockJson).toHaveBeenCalledWith(professor);
    });

    it('should return 404 when not found', async () => {
      mockRequest.params = { id: '99' };
      mockProfessor.findById.mockResolvedValue(null);

      await getProfessorById(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });

  describe('createProfessor', () => {
    it('should hash the password before storing it', async () => {
      const criado: IProfessor = { id: 1, name: 'Ana', email: 'ana@fiap.com' };
      mockRequest.body = { name: 'Ana', email: 'ana@fiap.com', password: 'segredo123' };
      mockProfessor.create.mockResolvedValue(criado);

      await createProfessor(mockRequest, mockResponse);

      const argumento = mockProfessor.create.mock.calls[0]![0];
      expect(argumento.password_hash).not.toBe('segredo123');
      await expect(comparePassword('segredo123', argumento.password_hash)).resolves.toBe(true);
      expect(mockStatus).toHaveBeenCalledWith(201);
    });

    it('should return 400 when fields are missing', async () => {
      mockRequest.body = { name: 'Ana' };

      await createProfessor(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockProfessor.create).not.toHaveBeenCalled();
    });

    it('should return 409 on duplicate email', async () => {
      mockRequest.body = { name: 'Ana', email: 'ana@fiap.com', password: 'segredo123' };
      mockProfessor.create.mockRejectedValue(uniqueViolation());

      await createProfessor(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Já existe um professor com este e-mail.' });
    });
  });

  describe('updateProfessor', () => {
    it('should keep the current password when none is sent', async () => {
      const atualizado: IProfessor = { id: 1, name: 'Ana Maria', email: 'ana@fiap.com' };
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Ana Maria', email: 'ana@fiap.com' };
      mockProfessor.update.mockResolvedValue(atualizado);

      await updateProfessor(mockRequest, mockResponse);

      expect(mockProfessor.update).toHaveBeenCalledWith(1, {
        name: 'Ana Maria',
        email: 'ana@fiap.com',
        password_hash: null
      });
    });

    it('should hash the new password when one is sent', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Ana', email: 'ana@fiap.com', password: 'nova-senha' };
      mockProfessor.update.mockResolvedValue({ id: 1, name: 'Ana', email: 'ana@fiap.com' });

      await updateProfessor(mockRequest, mockResponse);

      const hash = mockProfessor.update.mock.calls[0]![1].password_hash;
      expect(hash).not.toBeNull();
      await expect(comparePassword('nova-senha', hash as string)).resolves.toBe(true);
    });

    it('should return 404 when not found', async () => {
      mockRequest.params = { id: '99' };
      mockRequest.body = { name: 'Ana', email: 'ana@fiap.com' };
      mockProfessor.update.mockResolvedValue(null);

      await updateProfessor(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });

    it('should return 409 on duplicate email', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Ana', email: 'ja@existe.com' };
      mockProfessor.update.mockRejectedValue(uniqueViolation());

      await updateProfessor(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(409);
    });
  });

  describe('deleteProfessor', () => {
    it('should delete another professor', async () => {
      mockRequest.params = { id: '2' };
      mockRequest.professor = { id: 1, email: 'admin@fiap.com' };
      mockProfessor.delete.mockResolvedValue(true);

      await deleteProfessor(mockRequest, mockResponse);

      expect(mockProfessor.delete).toHaveBeenCalledWith(2);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Professor deletado com sucesso!' });
    });

    it('should block self-deletion with 409', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.professor = { id: 1, email: 'admin@fiap.com' };

      await deleteProfessor(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Você não pode excluir o próprio usuário.' });
      expect(mockProfessor.delete).not.toHaveBeenCalled();
    });

    it('should return 404 when not found', async () => {
      mockRequest.params = { id: '99' };
      mockRequest.professor = { id: 1, email: 'admin@fiap.com' };
      mockProfessor.delete.mockResolvedValue(false);

      await deleteProfessor(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });
});
