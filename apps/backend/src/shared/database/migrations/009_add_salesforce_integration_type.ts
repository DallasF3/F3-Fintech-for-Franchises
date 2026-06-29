import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Alter the integration_type enum to include 'salesforce'
  await knex.raw(`ALTER TYPE integration_type ADD VALUE IF NOT EXISTS 'salesforce'`);
}

export async function down(knex: Knex): Promise<void> {
  // Postgres does not support removing values from an enum type easily.
}
