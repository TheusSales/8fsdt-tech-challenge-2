import { pool } from '../database';

export interface IStudent {
  id?: number;
  name: string;
  email: string;
  ra?: string | null;
  created_at?: Date;
}

const FIELDS = 'id, name, email, ra, created_at';

export class Student {
  static async findAll(limit: number, offset: number): Promise<IStudent[]> {
    const result = await pool.query(
      `SELECT ${FIELDS} FROM students ORDER BY id LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  static async count(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) AS total FROM students');
    return Number(result.rows[0].total);
  }

  static async findById(id: number): Promise<IStudent | null> {
    const result = await pool.query(`SELECT ${FIELDS} FROM students WHERE id = $1`, [id]);
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0];
  }

  static async create(student: IStudent): Promise<IStudent> {
    const { name, email, ra } = student;
    const query = `
      INSERT INTO students (name, email, ra)
      VALUES ($1, $2, $3)
      RETURNING ${FIELDS};
    `;
    const result = await pool.query(query, [name, email, ra ?? null]);
    return result.rows[0];
  }

  static async update(id: number, student: IStudent): Promise<IStudent | null> {
    const { name, email, ra } = student;
    const query = `
      UPDATE students
      SET name = $1, email = $2, ra = $3
      WHERE id = $4
      RETURNING ${FIELDS};
    `;
    const result = await pool.query(query, [name, email, ra ?? null, id]);
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0];
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM students WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
