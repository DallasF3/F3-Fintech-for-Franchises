import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add unique index on transactions(store_id, clover_id) where clover_id is not null
  await knex.raw(`CREATE UNIQUE INDEX idx_transactions_store_clover ON transactions(store_id, clover_id) WHERE clover_id IS NOT NULL`);
  
  // Add unique index on refunds(store_id, clover_id) where clover_id is not null
  await knex.raw(`CREATE UNIQUE INDEX idx_refunds_store_clover ON refunds(store_id, clover_id) WHERE clover_id IS NOT NULL`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS idx_transactions_store_clover`);
  await knex.raw(`DROP INDEX IF EXISTS idx_refunds_store_clover`);
}
