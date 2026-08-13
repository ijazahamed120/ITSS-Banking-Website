/**
 * MongoDB connection helper for ITSS Banking Operations.
 * Credentials come from environment variables only — never hardcoded.
 */

import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';

let connectionPromise = null;

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx <= 0) return;

    const key = trimmed.substring(0, eqIdx).trim();
    const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']/, '').replace(/["']$/, '');
    if (!process.env[key]) {
      process.env[key] = val;
    }
  });
}

function getMongoUri() {
  loadEnvFile();
  const uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : '';
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not configured. Set MONGODB_URI in backend .env or environment variables.'
    );
  }
  return uri;
}

function getDbName() {
  loadEnvFile();
  const dbName = process.env.MONGODB_DB_NAME ? process.env.MONGODB_DB_NAME.trim() : '';
  if (!dbName) {
    throw new Error(
      'MONGODB_DB_NAME is not configured. Set MONGODB_DB_NAME in backend .env or environment variables.'
    );
  }
  return dbName;
}

/**
 * Connect to MongoDB using Mongoose.
 * Reuses an existing connection when already connected.
 * @returns {Promise<typeof mongoose>}
 */
export async function connectMongo() {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = getMongoUri();
  const dbName = getDbName();

  connectionPromise = Promise.race([
    mongoose
      .connect(uri, {
        dbName,
        serverSelectionTimeoutMS: 5000,
      })
      .then(() => {
        console.log(`[MongoDB] Connected to database "${dbName}"`);
        return mongoose;
      }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('[MongoDB] Connection timeout - check MONGODB_URI and network')), 8000)
    ),
  ]).catch((err) => {
    connectionPromise = null;
    console.error('[MongoDB] Connection failed:', err.message);
    throw err;
  });

  return connectionPromise;
}

/**
 * Gracefully disconnect from MongoDB.
 * @returns {Promise<void>}
 */
export async function disconnectMongo() {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
  connectionPromise = null;
  console.log('[MongoDB] Disconnected');
}

export { mongoose, getMongoUri, getDbName };
