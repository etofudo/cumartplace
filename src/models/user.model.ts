import pool from '../database/index.js';
import type { UserRow } from '../types/index.js';

export async function findByEmail(email: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    'SELECT * FROM users WHERE email = $1',
    [email],
  );
  return result.rows[0] ?? null;
}

export async function findById(userId: number): Promise<Omit<UserRow, 'password_hash'> | null> {
  const result = await pool.query<Omit<UserRow, 'password_hash'>>(
    `SELECT user_id, first_name, last_name, email, phone, role, created_at
     FROM users WHERE user_id = $1`,
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function create(input: {
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone?: string | undefined;
  role?: string | undefined;
}): Promise<Omit<UserRow, 'password_hash'>> {
  const role = input.role ?? 'buyer';
  const result = await pool.query<Omit<UserRow, 'password_hash'>>(
    `INSERT INTO users (first_name, last_name, email, password_hash, phone, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING user_id, first_name, last_name, email, phone, role, created_at`,
    [input.first_name, input.last_name, input.email, input.password_hash, input.phone ?? null, role],
  );
  return result.rows[0]!;
}

export async function update(
  userId: number,
  input: { first_name?: string | undefined; last_name?: string | undefined; phone?: string | undefined },
): Promise<Omit<UserRow, 'password_hash'> | null> {
  const result = await pool.query<Omit<UserRow, 'password_hash'>>(
    `UPDATE users
     SET first_name = COALESCE($1, first_name),
         last_name  = COALESCE($2, last_name),
         phone      = COALESCE($3, phone)
     WHERE user_id = $4
     RETURNING user_id, first_name, last_name, email, phone, role, created_at`,
    [input.first_name ?? null, input.last_name ?? null, input.phone ?? null, userId],
  );
  return result.rows[0] ?? null;
}
