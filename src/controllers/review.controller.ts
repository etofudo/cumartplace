import type { Request, Response } from 'express';
import * as ReviewModel from '../models/review.model.js';
import * as ProductModel from '../models/product.model.js';
import type { AuthRequest } from '../types/index.js';

export async function getProductReviews(req: Request, res: Response): Promise<void> {
  const productId = parseInt(req.params['productId'] as string);
  if (isNaN(productId)) {
    res.status(400).json({ message: 'Invalid product ID' });
    return;
  }

  try {
    const reviews = await ReviewModel.getProductReviews(productId);
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** Buyer only — leave a review on a product. */
export async function createProductReview(req: Request, res: Response): Promise<void> {
  const { userId } = (req as AuthRequest).user;
  const productId = parseInt(req.params['productId'] as string);
  if (isNaN(productId)) {
    res.status(400).json({ message: 'Invalid product ID' });
    return;
  }

  const { rating, comment } = req.body as { rating?: number; comment?: string };

  if (rating === undefined || rating < 1 || rating > 5) {
    res.status(400).json({ message: 'rating must be an integer between 1 and 5' });
    return;
  }

  try {
    const product = await ProductModel.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const review = await ReviewModel.createProductReview({
      product_id: productId,
      buyer_id: userId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('unique')) {
      res.status(409).json({ message: 'You have already reviewed this product' });
      return;
    }
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
