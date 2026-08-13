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

  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) return;

    const eqIdx = trimmed.indexOf('=');

    if (eqIdx <= 0) return;

    const key = trimmed.substring(0, eqIdx).trim();

    const val = trimmed
      .substring(eqIdx + 1)
      .trim()
      .replace(/^["']/, '')
      .replace(/["']$/, '');

    if (!process.env[key]) {
      process.env[key] = val;
    }
  });
}

function getMongoUri() {
  loadEnvFile();

  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not configured.'
    );
  }

  return uri;
}

function getDbName() {
  loadEnvFile();

  const dbName = process.env.MONGODB_DB_NAME?.trim();

  if (!dbName) {
    throw new Error(
      'MONGODB_DB_NAME is not configured.'
    );
  }

  return dbName;
}

export async function connectMongo() {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // Reuse connection attempt already in progress
  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = getMongoUri();
  const dbName = getDbName();

  console.log('[MongoDB] Starting connection...');
  console.log(`[MongoDB] Database: ${dbName}`);
  console.log(
    `[MongoDB] URI type: ${uri.startsWith('mongodb+srv://') ? 'Atlas SRV' : 'MongoDB URI'}`
  );

  connectionPromise = mongoose
    .connect(uri, {
      dbName,

      // Give Atlas/network enough time to respond.
      serverSelectionTimeoutMS: 15000,

      // Connection establishment timeout.
      connectTimeoutMS: 15000,

      // Keep the connection alive.
      socketTimeoutMS: 45000,

      // Helps on hosts where IPv6 causes connectivity problems.
      family: 4,
    })
    .then(() => {
      console.log(
        `[MongoDB] Connected successfully to database "${dbName}"`
      );

      return mongoose;
    })
    .catch((err) => {
      connectionPromise = null;

      console.error('[MongoDB] Connection failed:', err.message);

      throw err;
    });

  return connectionPromise;
}

export async function disconnectMongo() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();

  connectionPromise = null;

  console.log('[MongoDB] Disconnected');
}

export { mongoose, getMongoUri, getDbName };