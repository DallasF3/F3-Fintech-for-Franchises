import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Alter the integration_type enum to include 'hubspot'
  await knex.raw(`ALTER TYPE integration_type ADD VALUE IF NOT EXISTS 'hubspot'`);
}

export async function down(knex: Knex): Promise<void> {
  // Postgres does not support removing values from an enum type easily.
  // We leave it as is for down migrations.
}
