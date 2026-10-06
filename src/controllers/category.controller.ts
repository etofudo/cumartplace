import type { Request, Response } from 'express';
import * as CategoryModel from '../models/category.model.js';

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const categories = await CategoryModel.findAll();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const categoryId = parseInt(req.params['categoryId'] as string);
  if (isNaN(categoryId)) {
    res.status(400).json({ message: 'Invalid category ID' });
    return;
  }

  try {
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** Admin only — create a new category. */
export async function create(req: Request, res: Response): Promise<void> {
  const { name, description } = req.body as { name?: string; description?: string };

  if (!name) {
    res.status(400).json({ message: 'name is required' });
    return;
  }

  try {
    const category = await CategoryModel.create({ name, description });
    res.status(201).json(category);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('unique')) {
      res.status(409).json({ message: 'Category name already exists' });
      return;
    }
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
