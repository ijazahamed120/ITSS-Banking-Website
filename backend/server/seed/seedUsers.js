/**
 * Seed demo users into MongoDB from the existing DEMO_USERS accounts.
 *
 * Passwords are hashed with scrypt before storage — never stored as plaintext.
 *
 * Usage (manual only — not run automatically):
 *   npm run db:seed
 *
 * Requires MONGODB_URI and MONGODB_DB_NAME in .env or environment.
 */

import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { connectMongo, disconnectMongo } from '../db/connect.js';
import { User } from '../db/models/User.js';

/** Mirrors src/context/AuthContext.jsx DEMO_USERS (passwords hashed at seed time). */
const DEMO_USERS = [
  {
    employeeId: 'EMP-001',
    email: 'admin@itss.com',
    password: 'demo123',
    name: 'Sarah Jenkins',
    role: 'ADMIN',
  },
  {
    employeeId: 'EMP-002',
    email: 'compliance@itss.com',
    password: 'demo123',
    name: 'Sarah Jenkins',
    role: 'COMPLIANCE_OFFICER',
  },
  {
    employeeId: 'EMP-003',
    email: 'analyst@itss.com',
    password: 'demo123',
    name: 'Michael Raj',
    role: 'RISK_ANALYST',
  },
  {
    employeeId: 'EMP-004',
    email: 'auditor@itss.com',
    password: 'demo123',
    name: 'Priya Sharma',
    role: 'AUDITOR',
  },
];

const SCRYPT_KEYLEN = 64;

/**
 * Hash a password using scrypt + random salt.
 * Format: scrypt$<saltHex>$<hashHex>
 * @param {string} password
 * @returns {string}
 */
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(String(password), salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

/**
 * Verify a password against a stored scrypt hash (for future auth phases).
 * @param {string} password
 * @param {string} storedHash
 * @returns {boolean}
 */
export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.startsWith('scrypt$')) return false;

  const parts = storedHash.split('$');
  if (parts.length !== 3) return false;

  const salt = parts[1];
  const expectedHex = parts[2];
  const derived = scryptSync(String(password), salt, SCRYPT_KEYLEN);

  try {
    const expected = Buffer.from(expectedHex, 'hex');
    if (expected.length !== derived.length) return false;
    return timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

/**
 * Upsert demo users into the users collection.
 * @returns {Promise<{ created: number, updated: number, total: number }>}
 */
export async function seedUsers() {
  let created = 0;
  let updated = 0;

  for (const demoUser of DEMO_USERS) {
    const passwordHash = hashPassword(demoUser.password);
    const existing = await User.findOne({ employeeId: demoUser.employeeId }).select('+passwordHash');

    if (existing) {
      existing.email = demoUser.email.toLowerCase();
      existing.name = demoUser.name;
      existing.role = demoUser.role;
      existing.isActive = true;
      existing.passwordHash = passwordHash;
      await existing.save();
      updated += 1;
      console.log(`[Seed] Updated user ${demoUser.employeeId} (${demoUser.email})`);
    } else {
      await User.create({
        employeeId: demoUser.employeeId,
        email: demoUser.email.toLowerCase(),
        name: demoUser.name,
        role: demoUser.role,
        isActive: true,
        passwordHash,
      });
      created += 1;
      console.log(`[Seed] Created user ${demoUser.employeeId} (${demoUser.email})`);
    }
  }

  return { created, updated, total: DEMO_USERS.length };
}

async function main() {
  console.log('[Seed] Starting user seed...');
  await connectMongo();

  try {
    const result = await seedUsers();
    console.log(
      `[Seed] Complete — created: ${result.created}, updated: ${result.updated}, total: ${result.total}`
    );
  } finally {
    await disconnectMongo();
  }
}

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  main().catch((err) => {
    console.error('[Seed] Failed:', err.message);
    process.exit(1);
  });
}
