import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import knex from 'knex';

dotenv.config({ path: '../../../.env' });

const config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'franchise_dev',
  },
};

async function seed() {
  const db = knex(config);

  try {
    // Clear existing data (in reverse order of FK dependencies)
    await db('audit_logs').del();
    await db('invitations').del();
    await db('refresh_tokens').del();
    await db('stores').del();
    await db('users').del();
    await db('franchises').del();

    const franchiseId = uuidv4();
    const storeId = uuidv4();

    // Create franchise
    await db('franchises').insert({
      id: franchiseId,
      name: 'Happy Burger Co.',
      industry: 'Food & Beverage',
      logo_url: 'https://via.placeholder.com/200',
      settings: { notificationPreferences: { emailOnAlert: true } },
    });

    // Create admin user
    const adminId = uuidv4();
    const hashedAdminPassword = await bcrypt.hash('admin123!', 10);
    await db('users').insert({
      id: adminId,
      email: 'admin@franchiseos.local',
      password_hash: hashedAdminPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      is_active: true,
    });

    // Create franchisor user
    const franchissorId = uuidv4();
    const hashedFranchissorPassword = await bcrypt.hash('franchisor123!', 10);
    await db('users').insert({
      id: franchissorId,
      email: 'franchisor@franchiseos.local',
      password_hash: hashedFranchissorPassword,
      first_name: 'Franchisor',
      last_name: 'Owner',
      role: 'franchisor',
      franchise_id: franchiseId,
      is_active: true,
    });

    // Create franchisee user
    const franchiseeId = uuidv4();
    const hashedFranchiseePassword = await bcrypt.hash('franchisee123!', 10);
    await db('users').insert({
      id: franchiseeId,
      email: 'franchisee@franchiseos.local',
      password_hash: hashedFranchiseePassword,
      first_name: 'Store',
      last_name: 'Owner',
      role: 'franchisee',
      franchise_id: franchiseId,
      is_active: true,
    });

    // Create stores
    await db('stores').insert({
      id: storeId,
      franchise_id: franchiseId,
      name: 'Happy Burger - Downtown',
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94105',
      country: 'US',
      latitude: 37.7749,
      longitude: -122.4194,
      phone: '(415) 555-0100',
      status: 'active',
      timezone: 'America/Los_Angeles',
    });

    console.log('✓ Seed data created successfully');
    console.log('');
    console.log('Test Credentials:');
    console.log('─'.repeat(50));
    console.log('Admin:      admin@franchiseos.local / admin123!');
    console.log('Franchisor: franchisor@franchiseos.local / franchisor123!');
    console.log('Franchisee: franchisee@franchiseos.local / franchisee123!');
    console.log('─'.repeat(50));
  } catch (error) {
    console.error('✗ Seed failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

seed();
