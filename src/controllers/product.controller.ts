import type { Request, Response } from 'express';
import * as ProductModel from '../models/product.model.js';
import * as StoreModel from '../models/store.model.js';
import type { AuthRequest } from '../types/index.js';

export async function getAll(req: Request, res: Response): Promise<void> {
  const category_id = req.query['category_id'] ? parseInt(req.query['category_id'] as string) : undefined;
  const store_id    = req.query['store_id']    ? parseInt(req.query['store_id'] as string)    : undefined;
  const search      = req.query['search']      ? String(req.query['search'])                  : undefined;

  try {
    const products = await ProductModel.findAll({ category_id, store_id, search });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const productId = parseInt(req.params['productId'] as string);
  if (isNaN(productId)) {
    res.status(400).json({ message: 'Invalid product ID' });
    return;
  }

  try {
    const product = await ProductModel.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** Vendor only — create a product in their store. */
export async function create(req: Request, res: Response): Promise<void> {
  const { userId } = (req as AuthRequest).user;

  const { category_id, name, description, price, stock_quantity, image_url } = req.body as {
    category_id?: number;
    name?: string;
    description?: string;
    price?: number;
    stock_quantity?: number;
    image_url?: string;
  };

  if (!category_id || !name || price === undefined || stock_quantity === undefined) {
    res.status(400).json({ message: 'category_id, name, price and stock_quantity are required' });
    return;
  }

  try {
    const store = await StoreModel.findByVendor(userId);
    if (!store) {
      res.status(403).json({ message: 'You do not have a registered store' });
      return;
    }

    const product = await ProductModel.create({
      store_id: store.store_id,
      category_id,
      name,
      description,
      price,
      stock_quantity,
      image_url,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** Vendor only — update a product they own. */
export async function update(req: Request, res: Response): Promise<void> {
  const { userId } = (req as AuthRequest).user;
  const productId = parseInt(req.params['productId'] as string);
  if (isNaN(productId)) {
    res.status(400).json({ message: 'Invalid product ID' });
    return;
  }

  try {
    const store = await StoreModel.findByVendor(userId);
    if (!store) {
      res.status(403).json({ message: 'You do not have a registered store' });
      return;
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    if (product.store_id !== store.store_id) {
      res.status(403).json({ message: 'This product does not belong to your store' });
      return;
    }

    const { name, description, price, stock_quantity, image_url, is_available } = req.body as {
      name?: string;
      description?: string;
      price?: number;
      stock_quantity?: number;
      image_url?: string;
      is_available?: boolean;
    };

    const updated = await ProductModel.update(productId, {
      name, description, price, stock_quantity, image_url, is_available,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** Vendor only — delete a product they own. */
export async function remove(req: Request, res: Response): Promise<void> {
  const { userId } = (req as AuthRequest).user;
  const productId = parseInt(req.params['productId'] as string);
  if (isNaN(productId)) {
    res.status(400).json({ message: 'Invalid product ID' });
    return;
  }

  try {
    const store = await StoreModel.findByVendor(userId);
    if (!store) {
      res.status(403).json({ message: 'You do not have a registered store' });
      return;
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    if (product.store_id !== store.store_id) {
      res.status(403).json({ message: 'This product does not belong to your store' });
      return;
    }

    const deleted = await ProductModel.remove(productId);
    if (!deleted) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
