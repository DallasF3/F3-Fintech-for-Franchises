import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Customers Policy
  await knex.raw(`
    CREATE POLICY franchise_scope_customers ON customers
    FOR ALL USING (franchise_id = current_setting('app.current_franchise_id')::UUID);
  `);

  // 2. Transactions Policy
  await knex.raw(`
    CREATE POLICY franchise_scope_transactions ON transactions
    FOR ALL USING (
      store_id IN (
        SELECT id FROM stores
        WHERE franchise_id = current_setting('app.current_franchise_id')::UUID
      )
    );
  `);

  // 3. Settlements Policy
  await knex.raw(`
    CREATE POLICY franchise_scope_settlements ON settlements
    FOR ALL USING (
      store_id IN (
        SELECT id FROM stores
        WHERE franchise_id = current_setting('app.current_franchise_id')::UUID
      )
    );
  `);

  // 4. Refunds Policy
  await knex.raw(`
    CREATE POLICY franchise_scope_refunds ON refunds
    FOR ALL USING (
      store_id IN (
        SELECT id FROM stores
        WHERE franchise_id = current_setting('app.current_franchise_id')::UUID
      )
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP POLICY IF EXISTS franchise_scope_refunds ON refunds');
  await knex.raw('DROP POLICY IF EXISTS franchise_scope_settlements ON settlements');
  await knex.raw('DROP POLICY IF EXISTS franchise_scope_transactions ON transactions');
  await knex.raw('DROP POLICY IF EXISTS franchise_scope_customers ON customers');
}
