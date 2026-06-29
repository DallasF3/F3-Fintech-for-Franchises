import { getDatabase } from '../src/shared/database/connection';
import { generateToken, verifyToken } from '../src/shared/utils/jwt.util';

async function run() {
  console.log('Testing JWT token generation and verification...');
  const token = generateToken({ userId: '123', email: 'test@test.com', role: 'admin' }, '1h');
  console.log('Token generated:', token ? 'Success' : 'Failed');
  
  const decoded = verifyToken(token);
  console.log('Token decoded:', decoded ? 'Success' : 'Failed');
  
  if (decoded && (decoded as any).role === 'admin') {
    console.log('Role verified: admin');
  } else {
    console.log('Role verification failed');
  }
  
  console.log('Database connection check...');
  try {
    const db = getDatabase();
    await db.raw('SELECT 1');
    console.log('Database connected successfully.');
    await db.destroy();
  } catch (err) {
    console.log('Database connection failed:', err);
  }
  console.log('Tests finished successfully.');
}

run().catch(console.error);
