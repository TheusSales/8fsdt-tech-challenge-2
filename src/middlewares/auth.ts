import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import { Professor } from '../models/professor';

const BEARER_PREFIX = 'Bearer ';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    return res.status(401).json({ message: 'Token de autenticação ausente.' });
  }

  const token = header.slice(BEARER_PREFIX.length).trim();

  let payload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }

  try {
    // Assinatura válida não basta. O token vale 8h, e nesse intervalo o
    // professor pode ter sido excluído — sem esta consulta ele continuaria
    // criando posts e apagando outros professores com um crachá cancelado.
    // O custo é uma consulta por requisição autenticada, que é o preço de
    // revogar acesso na hora sem manter uma lista de tokens revogados.
    const professor = await Professor.findById(payload.id);
    if (!professor) {
      return res.status(401).json({ message: 'Sessão encerrada. Faça login novamente.' });
    }

    req.professor = payload;
    return next();
  } catch (error) {
    console.error('Erro ao validar a sessão:', error);
    return res.status(500).json({ message: 'Erro interno no servidor ao validar a sessão.' });
  }
};
