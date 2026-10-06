import type { Request, Response } from 'express';
import * as StoreModel from '../models/store.model.js';
import * as ReviewModel from '../models/review.model.js';
import type { AuthRequest } from '../types/index.js';

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const stores = await StoreModel.findAll();
    res.json(stores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const storeId = parseInt(req.params['storeId'] as string);
  if (isNaN(storeId)) {
    res.status(400).json({ message: 'Invalid store ID' });
    return;
  }

  try {
    const store = await StoreModel.findById(storeId);
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }
    res.json(store);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** Vendor only — create their store (one per vendor). */
export async function create(req: Request, res: Response): Promise<void> {
  const { userId } = (req as AuthRequest).user;
  const { store_name, description, logo_url } = req.body as {
    store_name?: string;
    description?: string;
    logo_url?: string;
  };

  if (!store_name) {
    res.status(400).json({ message: 'store_name is required' });
    return;
  }

  try {
    const existing = await StoreModel.findByVendor(userId);
    if (existing) {
      res.status(409).json({ message: 'You already have a registered store' });
      return;
    }

    const store = await StoreModel.create({ vendor_id: userId, store_name, description, logo_url });
    res.status(201).json(store);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('unique')) {
      res.status(409).json({ message: 'Store name already taken' });
      return;
    }
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** Vendor only — update their own store. */
export async function update(req: Request, res: Response): Promise<void> {
  const { userId } = (req as AuthRequest).user;
  const storeId = parseInt(req.params['storeId'] as string);
  if (isNaN(storeId)) {
    res.status(400).json({ message: 'Invalid store ID' });
    return;
  }

  try {
    const store = await StoreModel.findById(storeId);
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }
    if (store.vendor_id !== userId) {
      res.status(403).json({ message: 'You do not own this store' });
      return;
    }

    const { store_name, description, logo_url, is_active } = req.body as {
      store_name?: string;
      description?: string;
      logo_url?: string;
      is_active?: boolean;
    };

    const updated = await StoreModel.update(storeId, { store_name, description, logo_url, is_active });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Buyer only — rate a store.
 * TODO — implement this controller:
 *   1. Parse storeId from req.params
 *   2. Parse rating (integer 1–5) from req.body
 *   3. Validate the rating is between 1 and 5
 *   4. Call ReviewModel.rateStore({ store_id, buyer_id: userId, rating })
 *   5. Return 201 with the new rating
 */
export async function rateStore(req: Request, res: Response): Promise<void> {
  // TODO: implement this controller
  res.status(501).json({ message: 'TODO: rateStore not yet implemented' });
}

/**
 * Get all ratings for a store.
 * TODO — implement this controller:
 *   1. Parse storeId from req.params
 *   2. Call ReviewModel.getStoreRatings(storeId)
 *   3. Return the array of ratings
 */
export async function getStoreRatings(req: Request, res: Response): Promise<void> {
  // TODO: implement this controller
  res.status(501).json({ message: 'TODO: getStoreRatings not yet implemented' });
}
