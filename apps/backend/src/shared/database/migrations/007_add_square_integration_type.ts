import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // PostgreSQL doesn't allow ALTER TYPE inside a transaction block generally unless it's the only thing, 
  // but Knex migrations are wrapped in transactions by default.
  // The safe way is to use raw.
  await knex.raw(`ALTER TYPE integration_type ADD VALUE IF NOT EXISTS 'square'`);
}

export async function down(knex: Knex): Promise<void> {
  // PostgreSQL does not support removing values from an ENUM type easily.
  // So down is essentially a no-op or would require recreating the type.
}
