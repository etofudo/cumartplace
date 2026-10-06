import type { Request, Response } from 'express';
import * as CartModel from '../models/cart.model.js';
import * as ProductModel from '../models/product.model.js';
import type { AuthRequest } from '../types/index.js';

export async function getCart(req: Request, res: Response): Promise<void> {
  const { userId } = (req as AuthRequest).user;
  try {
    const cart = await CartModel.findOrCreate(userId);
    const items = await CartModel.getItems(cart.cart_id);
    const total = items.reduce((sum, item) => sum + parseFloat(item.price ?? '0') * item.quantity, 0);

    res.json({ cart_id: cart.cart_id, items, total: total.toFixed(2) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function addItem(req: Request, res: Response): Promise<void> {
  const { userId } = (req as AuthRequest).user;
  const { product_id, quantity = 1 } = req.body as { product_id?: number; quantity?: number };

  if (!product_id) {
    res.status(400).json({ message: 'product_id is required' });
    return;
  }

  try {
    const product = await ProductModel.findById(product_id);
    if (!product || !product.is_available) {
      res.status(404).json({ message: 'Product not found or unavailable' });
      return;
    }
    if (product.stock_quantity < quantity) {
      res.status(400).json({ message: 'Not enough stock' });
      return;
    }

    const cart = await CartModel.findOrCreate(userId);
    const item = await CartModel.addItem(cart.cart_id, product_id, quantity);
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Update the quantity of an item in the cart.
 *
 * TODO — implement this controller:
 *   1. Parse cartItemId from req.params
 *   2. Parse quantity from req.body — reject if quantity < 1
 *   3. Get the cart for the current user with CartModel.findOrCreate
 *   4. Call CartModel.updateItem(cart.cart_id, cartItemId, quantity)
 *   5. If null returned, send 404
 *   6. Otherwise send the updated item
 */
export async function updateItem(req: Request, res: Response): Promise<void> {
  // TODO: implement this controller
  res.status(501).json({ message: 'TODO: updateItem not yet implemented' });
}

/**
 * Remove an item from the cart.
 *
 * TODO — implement this controller:
 *   1. Parse cartItemId from req.params
 *   2. Get the cart for the current user with CartModel.findOrCreate
 *   3. Call CartModel.removeItem(cart.cart_id, cartItemId)
 *   4. If false returned, send 404
 *   5. Otherwise send 204 No Content
 */
export async function removeItem(req: Request, res: Response): Promise<void> {
  // TODO: implement this controller
  res.status(501).json({ message: 'TODO: removeItem not yet implemented' });
}
