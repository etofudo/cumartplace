import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

// One shared connection pool for the whole application.
// All models import this pool and call pool.query() directly.
const pool = new Pool({
  connectionString: process.env['DATABASE_URL'],
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export default pool;
