import { getDatabase, initializeDatabase } from './src/shared/database/connection';
import { EncryptionService } from './src/shared/encryption.service';
import * as dotenv from 'dotenv';
dotenv.config();

async function seedSquare() {
  await initializeDatabase();
  console.log('Seeding Square Sandbox Access Token...');
  const db = getDatabase();

  // Find a franchise to attach it to
  const franchise = await db('franchises').first();
  if (!franchise) {
    console.error('No franchises found in database. Create one first.');
    process.exit(1);
  }

  // The access token you provided
  const accessToken = 'EAAAl1iL9EPub59oOQ-EysTlKzDgtoJP8tIdOwaJrkXVc5luxMcXuZhDnCBKK9ky';
  
  const encryptedToken = EncryptionService.encrypt(accessToken);

  const credentials = {
    merchant_id: 'sandbox-merchant', // Placeholder, real ID usually isn't needed strictly for sandbox PAT
    access_token: encryptedToken,
    connected_at: new Date().toISOString(),
  };

  const existing = await db('integration_configs').where({ franchise_id: franchise.id, type: 'square' }).first();
  if (existing) {
    await db('integration_configs').where({ id: existing.id }).update({
      credentials: JSON.stringify(credentials),
      status: 'connected'
    });
    console.log(`✅ Updated existing Square integration config for franchise ${franchise.name}`);
  } else {
    await db('integration_configs').insert({
      franchise_id: franchise.id,
      type: 'square',
      status: 'connected',
      credentials: JSON.stringify(credentials),
      settings: JSON.stringify({ sync_frequency: '15m' }),
      error_count: 0
    });
    console.log(`✅ Inserted new Square integration config for franchise ${franchise.name}`);
  }

  process.exit(0);
}

seedSquare();
