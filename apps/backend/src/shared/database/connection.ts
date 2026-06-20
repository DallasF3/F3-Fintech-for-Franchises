import knex, { Knex } from 'knex';
import knexConfig from './knexfile';

let db: Knex | null = null;

export async function initializeDatabase(): Promise<Knex> {
  if (db) return db;

  const env = process.env.NODE_ENV || 'development';

  db = knex(knexConfig[env]);

  // Test the connection
  try {
    await db.raw('SELECT 1');
    console.log(`✓ Database connected (${env})`);
  } catch (error) {
    console.error('✗ Failed to connect to database:', error);
    process.exit(1);
  }

  return db;
}

export function getDatabase(): Knex {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
  }
}
