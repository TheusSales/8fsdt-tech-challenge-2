import { pool } from '../database';

export interface IPost {
  idpost?: number;
  titulo: string;
  conteudo: string;
  autor: string;
  datacriacao?: Date;
}

export class Post {
  static async findAll(): Promise<IPost[]> {
    const result = await pool.query('SELECT * FROM posts');
    return result.rows;
  }

  static async findById(id: number): Promise<IPost | null> {
    const result = await pool.query('SELECT * FROM posts WHERE idPost = $1', [id]);
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0];
  }

  static async search(query: string): Promise<IPost[]> {
    const result = await pool.query(
      'SELECT * FROM posts WHERE LOWER(titulo) LIKE LOWER($1) OR LOWER(conteudo) LIKE LOWER($1)',
      [`%${query}%`]
    );
    return result.rows;
  }

  static async create(post: IPost): Promise<IPost> {
    const { titulo, conteudo, autor } = post;
    const query = `
      INSERT INTO posts (titulo, conteudo, autor) 
      VALUES ($1, $2, $3) 
      RETURNING *;
    `;
    const values = [titulo, conteudo, autor];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id: number, post: IPost): Promise<IPost | null> {
    const { titulo, conteudo, autor } = post;
    const query = `
      UPDATE posts
      SET titulo = $1, conteudo = $2, autor = $3
      WHERE idPost = $4
      RETURNING *;
    `;
    const values = [titulo, conteudo, autor, id];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0];
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM posts WHERE idPost = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}