import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as UserModel from '../models/user.model.js';
import type { AuthRequest } from '../types/index.js';

export async function register(req: Request, res: Response): Promise<void> {
  const { first_name, last_name, email, password, phone, role } = req.body as {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    phone?: string;
    role?: string;
  };

  if (!first_name || !last_name || !email || !password) {
    res.status(400).json({ message: 'first_name, last_name, email and password are required' });
    return;
  }

  try {
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ first_name, last_name, email, password_hash, phone, role });

    res.status(201).json({ message: 'Registration successful', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ message: 'email and password are required' });
    return;
  }

  try {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      process.env['JWT_SECRET'] ?? 'secret',
      { expiresIn: '7d' },
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const { userId } = (req as AuthRequest).user;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  const { userId } = (req as AuthRequest).user;
  const { first_name, last_name, phone } = req.body as {
    first_name?: string;
    last_name?: string;
    phone?: string;
  };

  try {
    const user = await UserModel.update(userId, { first_name, last_name, phone });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
