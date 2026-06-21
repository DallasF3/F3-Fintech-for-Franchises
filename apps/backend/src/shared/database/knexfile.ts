import type { Knex } from 'knex';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../../.env' });

const getDatabaseConnection = () => {
  // Use DATABASE_URL if available (Supabase, Cloud providers)
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  // Fall back to individual connection parameters (local development)
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'franchise_dev',
  };
};

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: getDatabaseConnection(),
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './seeds',
      extension: 'ts',
    },
  },
  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL_TEST || {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME_TEST || 'franchise_test',
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './seeds',
      extension: 'ts',
    },
  },
  production: {
    client: 'pg',
    connection: {
      ...(process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL, ssl: true }
        : {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: true,
          }),
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './seeds',
      extension: 'ts',
    },
  },
};

export default config;
