import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // ========================================
  // INTEGRATION CONFIGS
  // ========================================
  await knex.schema.createTable('integration_configs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('franchise_id').notNullable().references('id').inTable('franchises');
    table.uuid('store_id').references('id').inTable('stores');
    table.enum('type', ['clover', 'payment', 'crm', 'loyalty', 'email', 'sms'], { useNative: true, enumName: 'integration_type' }).notNullable();
    table.enum('status', ['connected', 'disconnected', 'error', 'syncing'], { useNative: true, enumName: 'integration_status' }).notNullable().defaultTo('disconnected');
    table.jsonb('credentials').notNullable();
    table.jsonb('settings').defaultTo('{}');
    table.timestamp('last_sync_at', { useTz: true });
    table.text('last_error');
    table.integer('error_count').defaultTo(0);
    table.timestamps(true, true);

    table.unique(['franchise_id', 'store_id', 'type'], { indexName: 'idx_unique_integration_config' });
    table.index('franchise_id');
  });

  // ========================================
  // CUSTOMERS
  // ========================================
  await knex.schema.createTable('customers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('franchise_id').notNullable().references('id').inTable('franchises');
    table.uuid('store_id').references('id').inTable('stores');
    table.string('email', 255);
    table.string('phone', 20);
    table.string('first_name', 100);
    table.string('last_name', 100);
    table.string('clover_id', 100);
    table.string('crm_id', 100);
    table.string('loyalty_id', 100);
    table.integer('loyalty_points').defaultTo(0);
    table.string('loyalty_tier', 50);
    table.decimal('total_spend', 12, 2).defaultTo(0);
    table.integer('visit_count').defaultTo(0);
    table.timestamp('first_visit_at', { useTz: true });
    table.timestamp('last_visit_at', { useTz: true });
    table.specificType('tags', 'TEXT[]');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamps(true, true);
    table.timestamp('deleted_at', { useTz: true });

    table.index('franchise_id');
    table.index('store_id');
    table.index('email');
    table.index('clover_id');
    table.index('loyalty_id');
  });
  
  // Custom unique index where clover_id is not null
  await knex.raw(`CREATE UNIQUE INDEX idx_customers_franchise_clover ON customers(franchise_id, clover_id) WHERE clover_id IS NOT NULL`);

  // ========================================
  // TRANSACTIONS
  // ========================================
  await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('store_id').notNullable().references('id').inTable('stores');
    table.uuid('customer_id').references('id').inTable('customers');
    table.string('clover_id', 100);
    table.enum('type', ['sale', 'refund', 'void', 'auth', 'adjustment'], { useNative: true, enumName: 'transaction_type' }).notNullable().defaultTo('sale');
    table.enum('status', ['completed', 'pending', 'failed', 'voided', 'refunded'], { useNative: true, enumName: 'transaction_status' }).notNullable().defaultTo('completed');
    table.decimal('amount', 12, 2).notNullable();
    table.decimal('tax_amount', 12, 2).defaultTo(0);
    table.decimal('tip_amount', 12, 2).defaultTo(0);
    table.decimal('discount_amount', 12, 2).defaultTo(0);
    table.decimal('net_amount', 12, 2).notNullable();
    table.string('payment_method', 50);
    table.string('card_brand', 20);
    table.string('card_last_four', 4);
    table.jsonb('line_items').defaultTo('[]');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('transacted_at', { useTz: true }).notNullable();
    table.timestamps(true, true);

    table.index(['store_id', 'transacted_at']);
    table.index('customer_id');
    table.index('clover_id');
    table.index('type');
    table.index('status');
  });

  // ========================================
  // SETTLEMENTS
  // ========================================
  await knex.schema.createTable('settlements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('store_id').notNullable().references('id').inTable('stores');
    table.string('external_id', 100);
    table.enum('status', ['pending', 'funded', 'failed', 'reversed'], { useNative: true, enumName: 'settlement_status' }).notNullable().defaultTo('pending');
    table.decimal('gross_amount', 12, 2).notNullable();
    table.decimal('fees', 12, 2).defaultTo(0);
    table.decimal('chargebacks', 12, 2).defaultTo(0);
    table.decimal('adjustments', 12, 2).defaultTo(0);
    table.decimal('net_amount', 12, 2).notNullable();
    table.integer('transaction_count').defaultTo(0);
    table.timestamp('period_start', { useTz: true }).notNullable();
    table.timestamp('period_end', { useTz: true }).notNullable();
    table.timestamp('funded_at', { useTz: true });
    table.jsonb('metadata').defaultTo('{}');
    table.timestamps(true, true);

    table.index(['store_id', 'funded_at']);
    table.index('external_id');
  });

  // ========================================
  // REFUNDS
  // ========================================
  await knex.schema.createTable('refunds', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('transaction_id').notNullable().references('id').inTable('transactions');
    table.uuid('store_id').notNullable().references('id').inTable('stores');
    table.uuid('customer_id').references('id').inTable('customers');
    table.string('clover_id', 100);
    table.decimal('amount', 12, 2).notNullable();
    table.text('reason');
    table.enum('status', ['pending', 'completed', 'failed'], { useNative: true, enumName: 'refund_status' }).notNullable().defaultTo('pending');
    table.timestamp('refunded_at', { useTz: true });
    table.jsonb('metadata').defaultTo('{}');
    table.timestamps(true, true);

    table.index('transaction_id');
    table.index('store_id');
    table.index('refunded_at');
  });

  // ========================================
  // SYNC RUNS (Integration Logs)
  // ========================================
  await knex.schema.createTable('sync_runs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('integration_id').notNullable().references('id').inTable('integration_configs');
    table.enum('type', ['full', 'delta', 'webhook', 'manual'], { useNative: true, enumName: 'sync_type' }).notNullable();
    table.enum('status', ['running', 'completed', 'failed', 'partial'], { useNative: true, enumName: 'sync_status' }).notNullable().defaultTo('running');
    table.integer('records_fetched').defaultTo(0);
    table.integer('records_created').defaultTo(0);
    table.integer('records_updated').defaultTo(0);
    table.integer('records_failed').defaultTo(0);
    table.text('error_message');
    table.jsonb('error_details');
    table.timestamp('started_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('completed_at', { useTz: true });
    table.integer('duration_ms');

    table.index('integration_id');
    table.index('started_at');
  });

  // ========================================
  // WEBHOOK EVENTS
  // ========================================
  await knex.schema.createTable('webhook_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('integration_id').references('id').inTable('integration_configs');
    table.string('source', 100).notNullable();
    table.string('event_type', 100).notNullable();
    table.jsonb('payload').notNullable();
    table.text('signature');
    table.enum('status', ['received', 'processing', 'processed', 'failed'], { useNative: true, enumName: 'webhook_status' }).notNullable().defaultTo('received');
    table.timestamp('processed_at', { useTz: true });
    table.text('error_message');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['source', 'event_type']);
    table.index('created_at');
  });

  // ========================================
  // RLS POLICIES FOR NEW TABLES
  // ========================================
  await knex.raw('ALTER TABLE customers ENABLE ROW LEVEL SECURITY');
  await knex.raw('ALTER TABLE transactions ENABLE ROW LEVEL SECURITY');
  await knex.raw('ALTER TABLE settlements ENABLE ROW LEVEL SECURITY');
  await knex.raw('ALTER TABLE refunds ENABLE ROW LEVEL SECURITY');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('webhook_events');
  await knex.schema.dropTableIfExists('sync_runs');
  await knex.schema.dropTableIfExists('refunds');
  await knex.schema.dropTableIfExists('settlements');
  await knex.schema.dropTableIfExists('transactions');
  await knex.schema.dropTableIfExists('customers');
  await knex.schema.dropTableIfExists('integration_configs');
  
  await knex.raw('DROP TYPE IF EXISTS webhook_status');
  await knex.raw('DROP TYPE IF EXISTS sync_status');
  await knex.raw('DROP TYPE IF EXISTS sync_type');
  await knex.raw('DROP TYPE IF EXISTS refund_status');
  await knex.raw('DROP TYPE IF EXISTS settlement_status');
  await knex.raw('DROP TYPE IF EXISTS transaction_status');
  await knex.raw('DROP TYPE IF EXISTS transaction_type');
  await knex.raw('DROP TYPE IF EXISTS integration_status');
  await knex.raw('DROP TYPE IF EXISTS integration_type');
}
