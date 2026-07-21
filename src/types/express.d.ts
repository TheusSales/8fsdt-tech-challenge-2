import type { TokenPayload } from '../utils/jwt';

// Permite que o requireAuth injete o professor autenticado em req.professor.
declare global {
  namespace Express {
    interface Request {
      professor?: TokenPayload;
    }
  }
}

export {};
