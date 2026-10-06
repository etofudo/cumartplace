import type { Request, Response } from 'express';
import * as OrderModel from '../models/order.model.js';
import * as CartModel from '../models/cart.model.js';
import type { AuthRequest } from '../types/index.js';

/** Buyer — create an order from their cart (checkout). */
export async function checkout(req: Request, res: Response): Promise<void> {
  const { userId } = (req as AuthRequest).user;
  try {
    const cart = await CartModel.findOrCreate(userId);
    const order = await OrderModel.createFromCart(userId, cart.cart_id);
    res.status(201).json(order);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'Cart is empty' || err.message.startsWith('Not enough stock'))) {
      res.status(400).json({ message: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** Buyer — list their own orders. */
export async function getMyOrders(req: Request, res: Response): Promise<void> {
  const { userId } = (req as AuthRequest).user;
  try {
    const orders = await OrderModel.findByUser(userId);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** Buyer — get a single order (must belong to them). */
export async function getOne(req: Request, res: Response): Promise<void> {
  const { userId } = (req as AuthRequest).user;
  const orderId = parseInt(req.params['orderId'] as string);
  if (isNaN(orderId)) {
    res.status(400).json({ message: 'Invalid order ID' });
    return;
  }

  try {
    const order = await OrderModel.findById(orderId, userId);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Vendor / Admin — update an order's status.
 *
 * TODO — implement this controller:
 *   1. Parse orderId from req.params
 *   2. Parse status from req.body — must be 'pending' | 'completed' | 'cancelled'
 *   3. Validate the status value
 *   4. Call OrderModel.updateStatus(orderId, status)
 *   5. If null returned, send 404
 *   6. Otherwise send the updated order
 */
export async function updateStatus(req: Request, res: Response): Promise<void> {
  // TODO: implement this controller
  res.status(501).json({ message: 'TODO: updateStatus not yet implemented' });
}
