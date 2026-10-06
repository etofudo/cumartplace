import pool from '../database/index.js';
import type { StoreRow } from '../types/index.js';

export async function findAll(): Promise<StoreRow[]> {
  const result = await pool.query<StoreRow>(
    `SELECT s.*,
            u.first_name || ' ' || u.last_name AS vendor_name,
            COALESCE(ROUND(AVG(sr.rating), 1), 0) AS avg_rating,
            COUNT(sr.store_rating_id)             AS rating_count
     FROM stores s
     JOIN users u ON u.user_id = s.vendor_id
     LEFT JOIN store_ratings sr ON sr.store_id = s.store_id
     WHERE s.is_active = TRUE
     GROUP BY s.store_id, u.first_name, u.last_name
     ORDER BY s.store_name`,
  );
  return result.rows;
}

export async function findById(storeId: number): Promise<StoreRow | null> {
  const result = await pool.query<StoreRow>(
    `SELECT s.*,
            u.first_name || ' ' || u.last_name AS vendor_name,
            COALESCE(ROUND(AVG(sr.rating), 1), 0) AS avg_rating,
            COUNT(sr.store_rating_id)             AS rating_count
     FROM stores s
     JOIN users u ON u.user_id = s.vendor_id
     LEFT JOIN store_ratings sr ON sr.store_id = s.store_id
     WHERE s.store_id = $1
     GROUP BY s.store_id, u.first_name, u.last_name`,
    [storeId],
  );
  return result.rows[0] ?? null;
}

export async function findByVendor(vendorId: number): Promise<StoreRow | null> {
  const result = await pool.query<StoreRow>(
    'SELECT * FROM stores WHERE vendor_id = $1',
    [vendorId],
  );
  return result.rows[0] ?? null;
}

export async function create(input: {
  vendor_id: number;
  store_name: string;
  description?: string | undefined;
  logo_url?: string | undefined;
}): Promise<StoreRow> {
  const result = await pool.query<StoreRow>(
    `INSERT INTO stores (vendor_id, store_name, description, logo_url)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.vendor_id, input.store_name, input.description ?? null, input.logo_url ?? null],
  );
  return result.rows[0]!;
}

export async function update(
  storeId: number,
  input: {
    store_name?: string | undefined;
    description?: string | undefined;
    logo_url?: string | undefined;
    is_active?: boolean | undefined;
  },
): Promise<StoreRow | null> {
  const result = await pool.query<StoreRow>(
    `UPDATE stores
     SET store_name  = COALESCE($1, store_name),
         description = COALESCE($2, description),
         logo_url    = COALESCE($3, logo_url),
         is_active   = COALESCE($4, is_active)
     WHERE store_id = $5
     RETURNING *`,
    [
      input.store_name ?? null,
      input.description ?? null,
      input.logo_url ?? null,
      input.is_active ?? null,
      storeId,
    ],
  );
  return result.rows[0] ?? null;
}
