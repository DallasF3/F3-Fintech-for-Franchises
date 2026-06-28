import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add unique index on settlements(store_id, external_id) where external_id is not null
  await knex.raw(`CREATE UNIQUE INDEX idx_settlements_store_external ON settlements(store_id, external_id) WHERE external_id IS NOT NULL`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS idx_settlements_store_external`);
}
