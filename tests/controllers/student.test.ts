import { Request, Response } from 'express';
import { mock, MockProxy } from 'jest-mock-extended';
import { Student, IStudent } from '../../src/models/student';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} from '../../src/controllers/student';

jest.mock('../../src/models/student');

const mockStudent = Student as jest.Mocked<typeof Student>;

const uniqueViolation = () => Object.assign(new Error('duplicate key'), { code: '23505' });

describe('Student Controller', () => {
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

  describe('getStudents', () => {
    it('should return a paginated envelope', async () => {
      const items: IStudent[] = [{ id: 1, name: 'Ana', email: 'ana@aluno.com', ra: '2024001' }];
      mockRequest.query = { page: '2', pageSize: '10' };
      mockStudent.findAll.mockResolvedValue(items);
      mockStudent.count.mockResolvedValue(15);

      await getStudents(mockRequest, mockResponse);

      expect(mockStudent.findAll).toHaveBeenCalledWith(10, 10);
      expect(mockJson).toHaveBeenCalledWith({ items, page: 2, pageSize: 10, total: 15 });
    });

    it('should fall back to defaults when pagination params are absent', async () => {
      mockRequest.query = {};
      mockStudent.findAll.mockResolvedValue([]);
      mockStudent.count.mockResolvedValue(0);

      await getStudents(mockRequest, mockResponse);

      expect(mockStudent.findAll).toHaveBeenCalledWith(20, 0);
    });

    it('should handle errors', async () => {
      mockRequest.query = {};
      mockStudent.findAll.mockRejectedValue(new Error('Database error'));
      mockStudent.count.mockResolvedValue(0);

      await getStudents(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(500);
    });
  });

  describe('getStudentById', () => {
    it('should return the student', async () => {
      const student: IStudent = { id: 1, name: 'Ana', email: 'ana@aluno.com', ra: '2024001' };
      mockRequest.params = { id: '1' };
      mockStudent.findById.mockResolvedValue(student);

      await getStudentById(mockRequest, mockResponse);

      expect(mockJson).toHaveBeenCalledWith(student);
    });

    it('should return 404 when not found', async () => {
      mockRequest.params = { id: '99' };
      mockStudent.findById.mockResolvedValue(null);

      await getStudentById(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });

  describe('createStudent', () => {
    it('should create a student', async () => {
      const criado: IStudent = { id: 1, name: 'Ana', email: 'ana@aluno.com', ra: '2024001' };
      mockRequest.body = { name: 'Ana', email: 'ana@aluno.com', ra: '2024001' };
      mockStudent.create.mockResolvedValue(criado);

      await createStudent(mockRequest, mockResponse);

      expect(mockStudent.create).toHaveBeenCalledWith({
        name: 'Ana',
        email: 'ana@aluno.com',
        ra: '2024001'
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Aluno criado com sucesso!',
        student: criado
      });
    });

    it('should accept a student without ra', async () => {
      mockRequest.body = { name: 'Ana', email: 'ana@aluno.com' };
      mockStudent.create.mockResolvedValue({ id: 1, name: 'Ana', email: 'ana@aluno.com', ra: null });

      await createStudent(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(201);
    });

    it('should return 400 when fields are missing', async () => {
      mockRequest.body = { name: 'Ana' };

      await createStudent(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockStudent.create).not.toHaveBeenCalled();
    });

    it('should return 409 on duplicate email', async () => {
      mockRequest.body = { name: 'Ana', email: 'ana@aluno.com' };
      mockStudent.create.mockRejectedValue(uniqueViolation());

      await createStudent(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Já existe um aluno com este e-mail.' });
    });
  });

  describe('updateStudent', () => {
    it('should update a student', async () => {
      const atualizado: IStudent = { id: 1, name: 'Ana Maria', email: 'ana@aluno.com', ra: '2024001' };
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Ana Maria', email: 'ana@aluno.com', ra: '2024001' };
      mockStudent.update.mockResolvedValue(atualizado);

      await updateStudent(mockRequest, mockResponse);

      expect(mockStudent.update).toHaveBeenCalledWith(1, {
        name: 'Ana Maria',
        email: 'ana@aluno.com',
        ra: '2024001'
      });
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Aluno atualizado com sucesso!',
        student: atualizado
      });
    });

    it('should return 404 when not found', async () => {
      mockRequest.params = { id: '99' };
      mockRequest.body = { name: 'Ana', email: 'ana@aluno.com' };
      mockStudent.update.mockResolvedValue(null);

      await updateStudent(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });

    it('should return 400 when fields are missing', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Ana' };

      await updateStudent(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockStudent.update).not.toHaveBeenCalled();
    });

    it('should return 409 on duplicate email', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Ana', email: 'ja@existe.com' };
      mockStudent.update.mockRejectedValue(uniqueViolation());

      await updateStudent(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(409);
    });
  });

  describe('deleteStudent', () => {
    it('should delete a student', async () => {
      mockRequest.params = { id: '1' };
      mockStudent.delete.mockResolvedValue(true);

      await deleteStudent(mockRequest, mockResponse);

      expect(mockStudent.delete).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Aluno deletado com sucesso!' });
    });

    it('should return 404 when not found', async () => {
      mockRequest.params = { id: '99' };
      mockStudent.delete.mockResolvedValue(false);

      await deleteStudent(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });
});
