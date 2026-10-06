import pool from '../database/index.js';
import type { CartRow, CartItemRow } from '../types/index.js';

/** Get or create the single cart that belongs to a buyer. */
export async function findOrCreate(buyerId: number): Promise<CartRow> {
  const result = await pool.query<CartRow>(
    `INSERT INTO carts (buyer_id)
     VALUES ($1)
     ON CONFLICT (buyer_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [buyerId],
  );
  return result.rows[0]!;
}

/** Get cart contents with product details joined in. */
export async function getItems(cartId: number): Promise<CartItemRow[]> {
  const result = await pool.query<CartItemRow>(
    `SELECT ci.cart_item_id, ci.cart_id, ci.product_id, ci.quantity,
            p.name, p.price, p.image_url,
            s.store_name
     FROM cart_items ci
     JOIN products p ON p.product_id = ci.product_id
     JOIN stores s   ON s.store_id   = p.store_id
     WHERE ci.cart_id = $1
     ORDER BY ci.cart_item_id`,
    [cartId],
  );
  return result.rows;
}

/**
 * Add a product to the cart.
 * If the product is already in the cart, its quantity is incremented.
 */
export async function addItem(
  cartId: number,
  productId: number,
  quantity: number,
): Promise<CartItemRow> {
  const result = await pool.query<CartItemRow>(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
     RETURNING *`,
    [cartId, productId, quantity],
  );
  return result.rows[0]!;
}

/**
 * Update the quantity of a specific cart item.
 * Returns null if the item does not belong to this cart.
 *
 * TODO — implement this function:
 *   1. Run an UPDATE on cart_items
 *   2. Set quantity = $1 WHERE cart_item_id = $2 AND cart_id = $3
 *   3. Return the updated row, or null if rowCount is 0
 */
export async function updateItem(
  cartId: number,
  cartItemId: number,
  quantity: number,
): Promise<CartItemRow | null> {
  // TODO: write the SQL query and return the updated CartItemRow (or null)
  throw new Error(`TODO: updateItem(cartId=${cartId}, cartItemId=${cartItemId}, quantity=${quantity}) not yet implemented`);
}

/**
 * Remove a single item from the cart.
 * Returns true if a row was deleted, false otherwise.
 *
 * TODO — implement this function:
 *   1. DELETE FROM cart_items WHERE cart_item_id = $1 AND cart_id = $2
 *   2. Return true if rowCount > 0, otherwise false
 */
export async function removeItem(
  cartId: number,
  cartItemId: number,
): Promise<boolean> {
  // TODO: write the SQL query and return true/false
  throw new Error(`TODO: removeItem(cartId=${cartId}, cartItemId=${cartItemId}) not yet implemented`);
}

/** Clear all items from the cart (used internally after order checkout). */
export async function clearCart(cartId: number): Promise<void> {
  await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
}
