import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';

const BEARER_PREFIX = 'Bearer ';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    return res.status(401).json({ message: 'Token de autenticação ausente.' });
  }

  const token = header.slice(BEARER_PREFIX.length).trim();

  try {
    req.professor = verifyToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};
