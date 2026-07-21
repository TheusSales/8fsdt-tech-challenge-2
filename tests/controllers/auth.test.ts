import { Request, Response } from 'express';
import { mock, MockProxy } from 'jest-mock-extended';
import { Professor, IProfessorWithHash } from '../../src/models/professor';
import { login, me } from '../../src/controllers/auth';
import { requireAuth } from '../../src/middlewares/auth';
import { hashPassword } from '../../src/utils/password';
import { signToken } from '../../src/utils/jwt';

jest.mock('../../src/models/professor');

// Garante segredo próprio no teste, sem depender do .env da máquina.
process.env.JWT_SECRET = 'segredo-de-teste';

const mockProfessor = Professor as jest.Mocked<typeof Professor>;

const SENHA_CORRETA = 'admin123';

describe('Auth Controller', () => {
  let mockRequest: MockProxy<Request>;
  let mockResponse: MockProxy<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let professorSalvo: IProfessorWithHash;

  beforeAll(async () => {
    // Hash real: o teste exercita o bcrypt de verdade, não um mock.
    professorSalvo = {
      id: 1,
      name: 'Administrador FIAP',
      email: 'admin@fiap.com',
      password_hash: await hashPassword(SENHA_CORRETA),
    };
  });

  beforeEach(() => {
    mockRequest = mock<Request>();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = mock<Response>();
    mockResponse.json = mockJson;
    mockResponse.status = mockStatus;

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return a token and the professor on valid credentials', async () => {
      mockRequest.body = { email: 'admin@fiap.com', password: SENHA_CORRETA };
      mockProfessor.findByEmail.mockResolvedValue(professorSalvo);

      await login(mockRequest, mockResponse);

      expect(mockProfessor.findByEmail).toHaveBeenCalledWith('admin@fiap.com');
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          professor: { id: 1, name: 'Administrador FIAP', email: 'admin@fiap.com' },
        })
      );
    });

    it('should never leak the password hash in the response', async () => {
      mockRequest.body = { email: 'admin@fiap.com', password: SENHA_CORRETA };
      mockProfessor.findByEmail.mockResolvedValue(professorSalvo);

      await login(mockRequest, mockResponse);

      const payload = mockJson.mock.calls[0][0];
      expect(JSON.stringify(payload)).not.toContain(professorSalvo.password_hash);
    });

    it('should return 401 when the password is wrong', async () => {
      mockRequest.body = { email: 'admin@fiap.com', password: 'senha-errada' };
      mockProfessor.findByEmail.mockResolvedValue(professorSalvo);

      await login(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ message: 'E-mail ou senha inválidos.' });
    });

    it('should return 401 when the email does not exist', async () => {
      mockRequest.body = { email: 'ninguem@fiap.com', password: SENHA_CORRETA };
      mockProfessor.findByEmail.mockResolvedValue(null);

      await login(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ message: 'E-mail ou senha inválidos.' });
    });

    it('should return 400 when fields are missing', async () => {
      mockRequest.body = { email: 'admin@fiap.com' };

      await login(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockProfessor.findByEmail).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      mockRequest.body = { email: 'admin@fiap.com', password: SENHA_CORRETA };
      mockProfessor.findByEmail.mockRejectedValue(new Error('Database error'));

      await login(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Erro interno no servidor ao autenticar.',
      });
    });
  });

  describe('me', () => {
    it('should return the authenticated professor', async () => {
      mockRequest.professor = { id: 1, email: 'admin@fiap.com' };
      const publico = { id: 1, name: 'Administrador FIAP', email: 'admin@fiap.com' };
      mockProfessor.findById.mockResolvedValue(publico);

      await me(mockRequest, mockResponse);

      expect(mockProfessor.findById).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith(publico);
    });

    it('should return 401 when the professor no longer exists', async () => {
      mockRequest.professor = { id: 99, email: 'sumiu@fiap.com' };
      mockProfessor.findById.mockResolvedValue(null);

      await me(mockRequest, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(401);
    });
  });
});

describe('requireAuth middleware', () => {
  let mockRequest: MockProxy<Request>;
  let mockResponse: MockProxy<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = mock<Request>();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = mock<Response>();
    mockResponse.json = mockJson;
    mockResponse.status = mockStatus;
    mockNext = jest.fn();
  });

  it('should reject requests without a token', () => {
    mockRequest.headers = {};

    requireAuth(mockRequest, mockResponse, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject a malformed authorization header', () => {
    mockRequest.headers = { authorization: 'Basic abc123' };

    requireAuth(mockRequest, mockResponse, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject a token signed with another secret', () => {
    mockRequest.headers = { authorization: 'Bearer nao.e.um.token.valido' };

    requireAuth(mockRequest, mockResponse, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({ message: 'Token inválido ou expirado.' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should accept a valid token and inject req.professor', () => {
    const token = signToken({ id: 7, email: 'prof@fiap.com' });
    mockRequest.headers = { authorization: `Bearer ${token}` };

    requireAuth(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.professor).toEqual(
      expect.objectContaining({ id: 7, email: 'prof@fiap.com' })
    );
  });
});
