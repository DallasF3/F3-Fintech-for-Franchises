import { CloverOAuthService } from './src/modules/integration/services/clover-oauth.service';
import { initializeDatabase } from './src/shared/database/connection';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
  await initializeDatabase();
  const { getDatabase } = require('./src/shared/database/connection');
  const db = getDatabase();
  
  // Find or create a dummy franchise to link to
  let franchise = await db('franchises').first();
  if (!franchise) {
    const [inserted] = await db('franchises').insert({
      name: 'Test Franchise',
    }).returning('id');
    const id = typeof inserted === 'object' ? inserted.id : inserted;
    franchise = { id };
  }

  const { authorizationUrl } = CloverOAuthService.generateAuthorizationUrl(franchise.id);
  console.log('\n======================================================');
  console.log('👉 COPY AND PASTE THIS URL INTO YOUR WEB BROWSER:');
  console.log('======================================================\n');
  console.log(authorizationUrl);
  console.log('\n======================================================\n');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
