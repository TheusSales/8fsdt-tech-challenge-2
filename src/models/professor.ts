import { pool } from '../database';

export interface IProfessor {
  id?: number;
  name: string;
  email: string;
  created_at?: Date;
}

// O hash nunca sai em respostas HTTP — só o login precisa dele.
export interface IProfessorWithHash extends IProfessor {
  password_hash: string;
}

export interface IProfessorInput {
  name: string;
  email: string;
  password_hash: string;
}

const PUBLIC_FIELDS = 'id, name, email, created_at';

export class Professor {
  static async findAll(limit: number, offset: number): Promise<IProfessor[]> {
    const result = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM professors ORDER BY id LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  static async count(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) AS total FROM professors');
    return Number(result.rows[0].total);
  }

  static async findById(id: number): Promise<IProfessor | null> {
    const result = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM professors WHERE id = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<IProfessorWithHash | null> {
    const result = await pool.query(
      `SELECT ${PUBLIC_FIELDS}, password_hash FROM professors WHERE LOWER(email) = LOWER($1)`,
      [email]
    );
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0];
  }

  static async create(professor: IProfessorInput): Promise<IProfessor> {
    const { name, email, password_hash } = professor;
    const query = `
      INSERT INTO professors (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING ${PUBLIC_FIELDS};
    `;
    const result = await pool.query(query, [name, email, password_hash]);
    return result.rows[0];
  }

  // password_hash null mantém a senha atual (edição sem troca de senha).
  static async update(
    id: number,
    professor: { name: string; email: string; password_hash: string | null }
  ): Promise<IProfessor | null> {
    const { name, email, password_hash } = professor;
    const query = `
      UPDATE professors
      SET name = $1, email = $2, password_hash = COALESCE($3, password_hash)
      WHERE id = $4
      RETURNING ${PUBLIC_FIELDS};
    `;
    const result = await pool.query(query, [name, email, password_hash, id]);
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0];
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM professors WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
