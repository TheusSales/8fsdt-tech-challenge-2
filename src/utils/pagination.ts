export interface Pagination {
  page: number;
  pageSize: number;
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// Aceita ?page e ?pageSize; valores ausentes ou inválidos caem no padrão em vez
// de virarem erro — a listagem sempre responde algo.
export const parsePagination = (query: unknown): Pagination => {
  const source = (query ?? {}) as { page?: unknown; pageSize?: unknown };

  const parsedPage = Number.parseInt(String(source.page ?? ''), 10);
  const page = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);

  const parsedSize = Number.parseInt(String(source.pageSize ?? ''), 10);
  const pageSize = Number.isNaN(parsedSize)
    ? DEFAULT_PAGE_SIZE
    : Math.min(MAX_PAGE_SIZE, Math.max(1, parsedSize));

  return { page, pageSize, limit: pageSize, offset: (page - 1) * pageSize };
};
