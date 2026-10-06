import pool from '../database/index.js';
import type { CategoryRow } from '../types/index.js';

export async function findAll(): Promise<CategoryRow[]> {
  const result = await pool.query<CategoryRow>(
    'SELECT * FROM categories ORDER BY name',
  );
  return result.rows;
}

export async function findById(categoryId: number): Promise<CategoryRow | null> {
  const result = await pool.query<CategoryRow>(
    'SELECT * FROM categories WHERE category_id = $1',
    [categoryId],
  );
  return result.rows[0] ?? null;
}

export async function create(input: {
  name: string;
  description?: string | undefined;
}): Promise<CategoryRow> {
  const result = await pool.query<CategoryRow>(
    `INSERT INTO categories (name, description)
     VALUES ($1, $2)
     RETURNING *`,
    [input.name, input.description ?? null],
  );
  return result.rows[0]!;
}
