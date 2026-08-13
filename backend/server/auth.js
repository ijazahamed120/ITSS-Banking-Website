import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { User, Session } from './db/index.js';

const SCRYPT_KEYLEN = 64;
const SESSION_COOKIE_NAME = 'itss_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours
const LAST_SEEN_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes

export function normalizeLoginIdentifier(rawIdentifier) {
  const identifier = String(rawIdentifier || '').trim();
  return {
    email: identifier.toLowerCase(),
    employeeId: identifier.toUpperCase(),
    raw: identifier,
  };
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.startsWith('scrypt$')) return false;
  const parts = storedHash.split('$');
  if (parts.length !== 3) return false;

  const salt = parts[1];
  const expectedHash = parts[2];
  const derived = scryptSync(String(password), salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(expectedHash, 'hex');

  if (expected.length !== derived.length) return false;
  try {
    return timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

export function hashSessionToken(token) {
  return createHash('sha256').update(String(token)).digest('hex');
}

export function generateSessionToken() {
  return randomBytes(32).toString('hex');
}

export function parseCookies(cookieHeader) {
  if (!cookieHeader || typeof cookieHeader !== 'string') return {};
  return cookieHeader.split(';').reduce((acc, cookiePart) => {
    const [name, ...rest] = cookiePart.trim().split('=');
    if (!name) return acc;
    acc[name] = rest.join('=');
    return acc;
  }, {});
}

export function buildSessionCookie(token, { rememberMe = true } = {}) {
  const cookieParts = [`${SESSION_COOKIE_NAME}=${token}`, 'Path=/', 'HttpOnly', 'Secure', 'SameSite=Strict'];
  if (rememberMe) {
    cookieParts.push(`Max-Age=${SESSION_MAX_AGE_SECONDS}`);
  }
  return cookieParts.join('; ');
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function findActiveUserByIdentifier(identifier) {
  const normalized = normalizeLoginIdentifier(identifier);
  return User.findOne({
    isActive: true,
    $or: [{ email: normalized.email }, { employeeId: normalized.employeeId }],
  })
    .select('+passwordHash')
    .lean();
}

export async function createSessionForUser(userId) {
  const rawToken = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  const session = new Session({
    userId,
    tokenHash,
    expiresAt,
    lastSeenAt: new Date(),
  });
  await session.save();

  return { rawToken, session };
}

export async function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const rawToken = cookies[SESSION_COOKIE_NAME];
  if (!rawToken) {
    return null;
  }

  const tokenHash = hashSessionToken(rawToken);
  const session = await Session.findOne({ tokenHash }).exec();
  if (!session) {
    return null;
  }

  const now = new Date();
  if (!session.expiresAt || session.expiresAt <= now) {
    await Session.deleteOne({ _id: session._id }).catch(() => {});
    return null;
  }

  const user = await User.findById(session.userId)
    .select('employeeId email name role isActive')
    .lean();

  if (!user || !user.isActive) {
    await Session.deleteOne({ _id: session._id }).catch(() => {});
    return null;
  }

  if (!session.lastSeenAt || now - session.lastSeenAt > LAST_SEEN_THROTTLE_MS) {
    session.lastSeenAt = now;
    await session.save().catch(() => {});
  }

  return {
    user,
    session,
  };
}

export async function removeSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const rawToken = cookies[SESSION_COOKIE_NAME];
  if (!rawToken) return;
  const tokenHash = hashSessionToken(rawToken);
  await Session.deleteOne({ tokenHash }).catch(() => {});
}

export function buildSafeUserShape(user) {
  return {
    id: user.employeeId,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        reject(new Error('REQUEST_TOO_LARGE'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}
