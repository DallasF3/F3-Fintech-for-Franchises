import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable extensions
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // ========================================
  // FRANCHISES
  // ========================================
  await knex.schema.createTable('franchises', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 255).notNullable();
    table.string('industry', 100);
    table.text('logo_url');
    table.jsonb('settings').defaultTo('{}');
    table.timestamps(true, true);
    table.timestamp('deleted_at');
  });

  // ========================================
  // USERS
  // ========================================
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255);
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.enum('role', ['admin', 'franchisor', 'franchisee']).notNullable().defaultTo('franchisee');
    table.uuid('franchise_id').references('id').inTable('franchises');
    table.text('avatar_url');
    table.boolean('mfa_enabled').notNullable().defaultTo(false);
    table.text('mfa_secret');
    table.specificType('recovery_codes', 'TEXT[]');
    table.string('oauth_provider', 50);
    table.string('oauth_id', 255);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('last_login_at');
    table.timestamps(true, true);
    table.timestamp('deleted_at');

    table.index('email');
    table.index('franchise_id');
    table.index(['oauth_provider', 'oauth_id']);
  });

  // ========================================
  // STORES
  // ========================================
  await knex.schema.createTable('stores', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('franchise_id').notNullable().references('id').inTable('franchises');
    table.string('name', 255).notNullable();
    table.text('address');
    table.string('city', 100);
    table.string('state', 50);
    table.string('zip_code', 20);
    table.string('country', 50).defaultTo('US');
    table.decimal('latitude', 10, 8);
    table.decimal('longitude', 11, 8);
    table.string('phone', 20);
    table.enum('status', ['active', 'inactive', 'onboarding', 'suspended']).notNullable().defaultTo('onboarding');
    table.string('clover_merchant_id', 100);
    table.string('timezone', 50).defaultTo('America/New_York');
    table.jsonb('settings').defaultTo('{}');
    table.timestamps(true, true);
    table.timestamp('deleted_at');

    table.index('franchise_id');
    table.index('clover_merchant_id');
  });

  // ========================================
  // REFRESH TOKENS
  // ========================================
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token_hash', 255).notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('revoked_at');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('user_id');
    table.index('token_hash');
  });

  // ========================================
  // INVITATIONS
  // ========================================
  await knex.schema.createTable('invitations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email', 255).notNullable();
    table.enum('role', ['admin', 'franchisor', 'franchisee']).notNullable();
    table.uuid('franchise_id').references('id').inTable('franchises');
    table.uuid('store_id').references('id').inTable('stores');
    table.uuid('invited_by').notNullable().references('id').inTable('users');
    table.string('token_hash', 255).notNullable();
    table.enum('status', ['pending', 'accepted', 'expired', 'revoked']).notNullable().defaultTo('pending');
    table.timestamp('expires_at').notNullable();
    table.timestamp('accepted_at');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('email');
    table.index('token_hash');
  });

  // ========================================
  // AUDIT LOG
  // ========================================
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users');
    table.string('action', 100).notNullable();
    table.string('entity_type', 50);
    table.uuid('entity_id');
    table.jsonb('details');
    table.specificType('ip_address', 'INET');
    table.text('user_agent');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('user_id');
    table.index(['entity_type', 'entity_id']);
    table.index('created_at');
  });

  // ========================================
  // ROW-LEVEL SECURITY (RLS)
  // ========================================
  await knex.raw('ALTER TABLE users ENABLE ROW LEVEL SECURITY');
  await knex.raw('ALTER TABLE stores ENABLE ROW LEVEL SECURITY');

  // Create roles for RLS
  await knex.raw(`
    DO $$
    BEGIN
      CREATE ROLE app_admin;
      CREATE ROLE app_franchisor;
      CREATE ROLE app_franchisee;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END $$;
  `);

  // Admin sees everything
  await knex.raw(`
    CREATE POLICY admin_all_users ON users
      FOR ALL TO app_admin
      USING (TRUE);
  `).catch(() => null);

  // Franchisors see users in their franchise
  await knex.raw(`
    CREATE POLICY franchisor_users ON users
      FOR SELECT TO app_franchisor
      USING (franchise_id = current_setting('app.current_franchise_id')::UUID);
  `).catch(() => null);

  // Franchisees see only themselves
  await knex.raw(`
    CREATE POLICY franchisee_self ON users
      FOR SELECT TO app_franchisee
      USING (id = current_setting('app.current_user_id')::UUID);
  `).catch(() => null);

  // Stores RLS: Admins see all, franchisors see their franchise stores
  await knex.raw(`
    CREATE POLICY admin_all_stores ON stores
      FOR ALL TO app_admin
      USING (TRUE);
  `).catch(() => null);

  await knex.raw(`
    CREATE POLICY franchisor_stores ON stores
      FOR SELECT TO app_franchisor
      USING (franchise_id = current_setting('app.current_franchise_id')::UUID);
  `).catch(() => null);
}

export async function down(knex: Knex): Promise<void> {
  // Drop policies first
  await knex.raw('DROP POLICY IF EXISTS franchisee_self ON users').catch(() => null);
  await knex.raw('DROP POLICY IF EXISTS franchisor_users ON users').catch(() => null);
  await knex.raw('DROP POLICY IF EXISTS admin_all_users ON users').catch(() => null);
  await knex.raw('DROP POLICY IF EXISTS franchisor_stores ON stores').catch(() => null);
  await knex.raw('DROP POLICY IF EXISTS admin_all_stores ON stores').catch(() => null);

  // Drop tables in reverse order
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('invitations');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('stores');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('franchises');

  // Drop roles
  await knex.raw('DROP ROLE IF EXISTS app_franchisee').catch(() => null);
  await knex.raw('DROP ROLE IF EXISTS app_franchisor').catch(() => null);
  await knex.raw('DROP ROLE IF EXISTS app_admin').catch(() => null);

  // Drop extensions
  await knex.raw('DROP EXTENSION IF EXISTS "pgcrypto"').catch(() => null);
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"').catch(() => null);
}
