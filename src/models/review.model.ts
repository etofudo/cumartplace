import pool from '../database/index.js';
import type { ProductReviewRow, StoreRatingRow } from '../types/index.js';

// ── Product Reviews ────────────────────────────────────────────────────────

export async function getProductReviews(productId: number): Promise<ProductReviewRow[]> {
  const result = await pool.query<ProductReviewRow>(
    `SELECT pr.*, u.first_name, u.last_name
     FROM product_reviews pr
     JOIN users u ON u.user_id = pr.buyer_id
     WHERE pr.product_id = $1
     ORDER BY pr.created_at DESC`,
    [productId],
  );
  return result.rows;
}

export async function createProductReview(input: {
  product_id: number;
  buyer_id: number;
  rating: number;
  comment?: string | undefined;
}): Promise<ProductReviewRow> {
  const result = await pool.query<ProductReviewRow>(
    `INSERT INTO product_reviews (product_id, buyer_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.product_id, input.buyer_id, input.rating, input.comment ?? null],
  );
  return result.rows[0]!;
}

// ── Store Ratings ──────────────────────────────────────────────────────────

/**
 * Get all ratings for a store.
 *
 * TODO — implement this function:
 *   1. SELECT sr.*, u.first_name, u.last_name
 *      FROM store_ratings sr
 *      JOIN users u ON u.user_id = sr.buyer_id
 *      WHERE sr.store_id = $1
 *      ORDER BY sr.created_at DESC
 *   2. Return the array of StoreRatingRow
 */
export async function getStoreRatings(storeId: number): Promise<StoreRatingRow[]> {
  // TODO: write the SQL query and return the rows
  throw new Error(`TODO: getStoreRatings(storeId=${storeId}) not yet implemented`);
}

/**
 * Rate a store (one rating per buyer per store — the DB enforces this with a UNIQUE constraint).
 *
 * TODO — implement this function:
 *   1. INSERT INTO store_ratings (store_id, buyer_id, rating)
 *      VALUES ($1, $2, $3)
 *      ON CONFLICT (store_id, buyer_id) DO UPDATE SET rating = EXCLUDED.rating
 *      RETURNING *
 *   2. Return the StoreRatingRow
 */
export async function rateStore(input: {
  store_id: number;
  buyer_id: number;
  rating: number;
}): Promise<StoreRatingRow> {
  // TODO: write the upsert query and return the row
  throw new Error(`TODO: rateStore(store_id=${input.store_id}, buyer_id=${input.buyer_id}) not yet implemented`);
}
