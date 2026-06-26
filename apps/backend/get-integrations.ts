import { initializeDatabase } from './src/shared/database/connection';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
  await initializeDatabase();
  const { getDatabase } = require('./src/shared/database/connection');
  const db = getDatabase();

  const configs = await db('integration_configs').select('*');
  
  console.log('\n======================================================');
  console.log('📊 CURRENT INTEGRATIONS IN DATABASE:');
  console.log('======================================================\n');
  
  if (configs.length === 0) {
    console.log('No integrations found in database.');
  } else {
    configs.forEach((config: any) => {
      console.log(`ID: ${config.id}`);
      console.log(`Franchise ID: ${config.franchise_id}`);
      console.log(`Type: ${config.type}`);
      console.log(`Status: ${config.status}`);
      console.log(`Created At: ${config.created_at}`);
      console.log('------------------------------------------------------');
    });
  }
  
  console.log('\n======================================================\n');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
