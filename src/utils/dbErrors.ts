// Códigos de erro do Postgres que representam entrada inválida do usuário, e
// não falha do servidor. Sem esse tratamento eles viravam 500, o que faz o
// cliente sugerir "tente de novo" para algo que nunca vai funcionar sozinho.
const UNIQUE_VIOLATION = '23505';
const STRING_DATA_RIGHT_TRUNCATION = '22001';

const codeOf = (error: unknown): string | undefined => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code?: unknown }).code);
  }
  return undefined;
};

// E-mail já cadastrado.
export const isUniqueViolation = (error: unknown): boolean =>
  codeOf(error) === UNIQUE_VIOLATION;

// Texto maior que o VARCHAR da coluna. O Postgres não informa qual coluna
// estourou, então quem chama precisa dizer os limites na mensagem.
export const isValueTooLong = (error: unknown): boolean =>
  codeOf(error) === STRING_DATA_RIGHT_TRUNCATION;
