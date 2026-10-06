import pool from '../database/index.js';
import type { ProductRow } from '../types/index.js';

export async function findAll(filters: {
  category_id?: number | undefined;
  store_id?: number | undefined;
  search?: string | undefined;
}): Promise<ProductRow[]> {
  const conditions: string[] = ['p.is_available = TRUE'];
  const params: unknown[] = [];

  if (filters.category_id) {
    params.push(filters.category_id);
    conditions.push(`p.category_id = $${params.length}`);
  }
  if (filters.store_id) {
    params.push(filters.store_id);
    conditions.push(`p.store_id = $${params.length}`);
  }
  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(`p.name ILIKE $${params.length}`);
  }

  const where = conditions.join(' AND ');

  const result = await pool.query<ProductRow>(
    `SELECT p.*,
            c.name                                AS category_name,
            s.store_name,
            COALESCE(ROUND(AVG(pr.rating), 1), 0) AS avg_rating,
            COUNT(pr.review_id)                   AS review_count
     FROM products p
     JOIN categories c ON c.category_id = p.category_id
     JOIN stores s     ON s.store_id     = p.store_id
     LEFT JOIN product_reviews pr ON pr.product_id = p.product_id
     WHERE ${where}
     GROUP BY p.product_id, c.name, s.store_name
     ORDER BY p.created_at DESC`,
    params,
  );
  return result.rows;
}

export async function findById(productId: number): Promise<ProductRow | null> {
  const result = await pool.query<ProductRow>(
    `SELECT p.*,
            c.name                                AS category_name,
            s.store_name,
            COALESCE(ROUND(AVG(pr.rating), 1), 0) AS avg_rating,
            COUNT(pr.review_id)                   AS review_count
     FROM products p
     JOIN categories c ON c.category_id = p.category_id
     JOIN stores s     ON s.store_id     = p.store_id
     LEFT JOIN product_reviews pr ON pr.product_id = p.product_id
     WHERE p.product_id = $1
     GROUP BY p.product_id, c.name, s.store_name`,
    [productId],
  );
  return result.rows[0] ?? null;
}

export async function create(input: {
  store_id: number;
  category_id: number;
  name: string;
  description?: string | undefined;
  price: number;
  stock_quantity: number;
  image_url?: string | undefined;
}): Promise<ProductRow> {
  const result = await pool.query<ProductRow>(
    `INSERT INTO products (store_id, category_id, name, description, price, stock_quantity, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      input.store_id,
      input.category_id,
      input.name,
      input.description ?? null,
      input.price,
      input.stock_quantity,
      input.image_url ?? null,
    ],
  );
  return result.rows[0]!;
}

export async function update(
  productId: number,
  input: {
    name?: string | undefined;
    description?: string | undefined;
    price?: number | undefined;
    stock_quantity?: number | undefined;
    image_url?: string | undefined;
    is_available?: boolean | undefined;
  },
): Promise<ProductRow | null> {
  const result = await pool.query<ProductRow>(
    `UPDATE products
     SET name           = COALESCE($1, name),
         description    = COALESCE($2, description),
         price          = COALESCE($3, price),
         stock_quantity = COALESCE($4, stock_quantity),
         image_url      = COALESCE($5, image_url),
         is_available   = COALESCE($6, is_available)
     WHERE product_id = $7
     RETURNING *`,
    [
      input.name ?? null,
      input.description ?? null,
      input.price ?? null,
      input.stock_quantity ?? null,
      input.image_url ?? null,
      input.is_available ?? null,
      productId,
    ],
  );
  return result.rows[0] ?? null;
}

export async function remove(productId: number): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM products WHERE product_id = $1',
    [productId],
  );
  return (result.rowCount ?? 0) > 0;
}
