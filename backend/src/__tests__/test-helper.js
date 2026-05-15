import { beforeAll, afterAll, afterEach } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

export async function setupTestDB() {
  process.env.NODE_ENV = 'test';
  process.env.BCRYPT_SALT_ROUNDS = '4';
  process.env.PORT = '0';
  process.env.FRONTEND_URL = 'http://localhost:5173';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
  process.env.JWT_SECRET_EXPIRES_IN = '1h';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing';
  process.env.JWT_REFRESH_SECRET_EXPIRES_IN = '7d';

  mongoServer = await MongoMemoryServer.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  process.env.MONGODB_URL = mongoServer.getUri();
  await mongoose.connect(process.env.MONGODB_URL);
}

export async function teardownTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}

export async function clearCollections() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}
