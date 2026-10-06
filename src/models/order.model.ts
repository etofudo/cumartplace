import pool from '../database/index.js';
import type { OrderRow, OrderItemRow } from '../types/index.js';

/** Fetch all orders for a buyer, including their line items. */
export async function findByUser(buyerId: number): Promise<OrderRow[]> {
  const ordersResult = await pool.query<OrderRow>(
    `SELECT * FROM orders WHERE buyer_id = $1 ORDER BY created_at DESC`,
    [buyerId],
  );
  const orders = ordersResult.rows;

  for (const order of orders) {
    const itemsResult = await pool.query<OrderItemRow>(
      `SELECT oi.*, p.name
       FROM order_items oi
       JOIN products p ON p.product_id = oi.product_id
       WHERE oi.order_id = $1`,
      [order.order_id],
    );
    order.items = itemsResult.rows;
  }

  return orders;
}

/** Fetch a single order with its line items. */
export async function findById(orderId: number, buyerId?: number | undefined): Promise<OrderRow | null> {
  const params: unknown[] = [orderId];
  let sql = 'SELECT * FROM orders WHERE order_id = $1';
  if (buyerId !== undefined) {
    params.push(buyerId);
    sql += ` AND buyer_id = $2`;
  }

  const result = await pool.query<OrderRow>(sql, params);
  const order = result.rows[0] ?? null;
  if (!order) return null;

  const itemsResult = await pool.query<OrderItemRow>(
    `SELECT oi.*, p.name
     FROM order_items oi
     JOIN products p ON p.product_id = oi.product_id
     WHERE oi.order_id = $1`,
    [order.order_id],
  );
  order.items = itemsResult.rows;
  return order;
}

/**
 * Checkout: create an order from the buyer's current cart.
 * Uses a transaction to ensure atomicity:
 *   1. Fetch cart items + lock product rows
 *   2. Validate stock
 *   3. Insert order
 *   4. Insert order_items (with unit_price locked to current price)
 *   5. Decrement stock_quantity for each product
 *   6. Clear cart
 */
export async function createFromCart(
  buyerId: number,
  cartId: number,
): Promise<OrderRow> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Step 1: fetch cart items, locking product rows to prevent concurrent stock issues
    const itemsResult = await client.query<{
      cart_item_id: number;
      product_id: number;
      quantity: number;
      price: string;
      name: string;
      store_id: number;
      stock_quantity: number;
    }>(
      `SELECT ci.cart_item_id, ci.product_id, ci.quantity,
              p.price, p.name, p.store_id, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON p.product_id = ci.product_id
       WHERE ci.cart_id = $1
       FOR UPDATE OF p`,
      [cartId],
    );

    const items = itemsResult.rows;
    if (items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Step 2: validate stock
    for (const item of items) {
      if (item.stock_quantity < item.quantity) {
        throw new Error(`Not enough stock for product "${item.name}"`);
      }
    }

    // Step 3: calculate total and insert order
    const total = items.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0,
    );

    const orderResult = await client.query<OrderRow>(
      `INSERT INTO orders (buyer_id, total_amount)
       VALUES ($1, $2)
       RETURNING *`,
      [buyerId, total.toFixed(2)],
    );
    const order = orderResult.rows[0]!;

    // Step 4 & 5: insert order_items and decrement stock
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, store_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.order_id, item.product_id, item.store_id, item.quantity, item.price],
      );

      await client.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2`,
        [item.quantity, item.product_id],
      );
    }

    // Step 6: clear the cart
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update order status (vendor/admin only).
 *
 * TODO — implement this function:
 *   1. UPDATE orders SET order_status = $1 WHERE order_id = $2
 *   2. Return the updated OrderRow, or null if not found
 *   3. Validate that status is one of 'pending' | 'completed' | 'cancelled'
 */
export async function updateStatus(
  orderId: number,
  status: 'pending' | 'completed' | 'cancelled',
): Promise<OrderRow | null> {
  // TODO: write the SQL UPDATE and return the updated row
  throw new Error(`TODO: updateStatus(orderId=${orderId}, status="${status}") not yet implemented`);
}
