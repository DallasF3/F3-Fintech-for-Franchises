import { getDatabase, initializeDatabase } from './src/shared/database/connection';
import { squareConnector } from './src/modules/integration/services/square.connector';
import * as dotenv from 'dotenv';
dotenv.config();

async function testSquareSync() {
  await initializeDatabase();
  console.log('Testing Square Connector Sync...');
  const db = getDatabase();

  const config = await db('integration_configs').where({ type: 'square' }).first();
  if (!config) {
    console.error('No Square integration config found. Run seed-square.ts first.');
    process.exit(1);
  }

  try {
    const result = await squareConnector.fullSync(config, { batchSize: 100 });
    console.log('✅ Sync Completed successfully!');
    console.log(`Fetched: ${result.recordsFetched}`);
    console.log(`Created: ${result.recordsCreated}`);
    console.log(`Updated: ${result.recordsUpdated}`);
    console.log(`Failed:  ${result.recordsFailed}`);
    
    if (result.errors && result.errors.length > 0) {
      console.log('Errors encountered:', result.errors);
    }
  } catch (error: any) {
    console.error('❌ Sync failed:', error.message);
  }

  process.exit(0);
}

testSquareSync();
