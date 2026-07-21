import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: number;
  email: string;
}

const EXPIRES_IN = '8h';

// Lido sob demanda (e não no import) para que o dotenv já tenha carregado o .env
// e para que os testes possam definir o segredo antes de chamar.
const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado no ambiente.');
  }
  return secret;
};

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, getSecret(), { expiresIn: EXPIRES_IN });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, getSecret()) as TokenPayload;
};
