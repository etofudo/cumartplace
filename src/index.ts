import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import authRoutes     from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import storeRoutes    from './routes/store.routes.js';
import productRoutes  from './routes/product.routes.js';
import cartRoutes     from './routes/cart.routes.js';
import orderRoutes    from './routes/order.routes.js';
import reviewRoutes   from './routes/review.routes.js';

const app = express();

// ── Resolve __dirname for ESM ──────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ── Global middleware ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Serve the frontend (View layer) from /public ───────────────────────────
// Students edit the HTML/CSS/JS files in public/ — Express delivers them here.
// The API routes below are the Controller layer that the FE calls via fetch().
app.use(express.static(join(__dirname, '..', 'public')));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use(authRoutes);
app.use(categoryRoutes);
app.use(storeRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use(orderRoutes);
app.use(reviewRoutes);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── 404 fallback ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Start server ───────────────────────────────────────────────────────────
const PORT = parseInt(process.env['PORT'] ?? '3000', 10);
app.listen(PORT, () => {
  console.log(`cumartplace API running on http://localhost:${PORT}`);
});
