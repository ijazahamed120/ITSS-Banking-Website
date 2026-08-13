import { connectMongo } from '../server/db/connect.js';
import {
  findActiveUserByIdentifier,
  createSessionForUser,
  getSessionFromRequest,
  removeSessionFromRequest,
  buildSafeUserShape,
  parseJsonBody,
  verifyPassword,
  buildSessionCookie,
  clearSessionCookie,
} from '../server/auth.js';
import { sendJsonResponse } from './corsMiddleware.js';

/**
 * Handle login endpoint
 */
export async function handleLogin(req, res) {
  try {
    // Timeout after 5 seconds if MongoDB doesn't connect
    const connectionPromise = connectMongo().catch(err => {
      console.warn('[Auth Middleware] MongoDB unavailable:', err.message);
      return null;
    });

    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => {
        console.warn('[Auth Middleware] MongoDB connection timeout');
        resolve(null);
      }, 5000)
    );

    await Promise.race([connectionPromise, timeoutPromise]);

    const body = await parseJsonBody(req);
    const identifier = body.email || body.employeeId || body.identifier || '';
    const password = String(body.password || '').trim();
    const rememberMe = Boolean(body.rememberMe);

    if (!identifier || !password) {
      sendJsonResponse(res, 401, {
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid employee ID or password. Please try again.',
      });
      return;
    }

    const user = await findActiveUserByIdentifier(identifier);
    const isValid = user && user.passwordHash && verifyPassword(password, user.passwordHash);
    if (!isValid) {
      sendJsonResponse(res, 401, {
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid employee ID or password. Please try again.',
      });
      return;
    }

    const { rawToken } = await createSessionForUser(user._id);
    const safeUser = buildSafeUserShape(user);
    const cookie = buildSessionCookie(rawToken, { rememberMe });

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie,
    });
    res.end(JSON.stringify({ user: safeUser }));
  } catch (err) {
    console.error('[Auth Middleware] /api/auth/login error:', err);
    sendJsonResponse(res, 500, {
      error: 'DB_CONNECTION_ERROR',
      message: 'Unable to authenticate at this time.',
      details: err.message,
    });
  }
}

/**
 * Handle session endpoint
 */
export async function handleSession(req, res) {
  try {
    // Timeout after 5 seconds if MongoDB doesn't connect
    const connectionPromise = connectMongo().catch(err => {
      console.warn('[Auth Middleware] MongoDB unavailable:', err.message);
      return null;
    });

    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => {
        console.warn('[Auth Middleware] MongoDB connection timeout');
        resolve(null);
      }, 5000)
    );

    await Promise.race([connectionPromise, timeoutPromise]);

    const sessionData = await getSessionFromRequest(req);
    if (!sessionData || !sessionData.user) {
      sendJsonResponse(res, 200, { user: null });
      return;
    }

    sendJsonResponse(res, 200, { user: buildSafeUserShape(sessionData.user) });
  } catch (err) {
    console.error('[Auth Middleware] /api/auth/session error:', err);
    sendJsonResponse(res, 500, {
      error: 'DB_CONNECTION_ERROR',
      message: 'Database connection unavailable.',
      details: err.message,
    });
  }
}

/**
 * Handle logout endpoint
 */
export async function handleLogout(req, res) {
  try {
    // Timeout after 5 seconds if MongoDB doesn't connect
    const connectionPromise = connectMongo().catch(err => {
      console.warn('[Auth Middleware] MongoDB unavailable:', err.message);
      return null;
    });

    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => {
        console.warn('[Auth Middleware] MongoDB connection timeout');
        resolve(null);
      }, 5000)
    );

    await Promise.race([connectionPromise, timeoutPromise]);

    await removeSessionFromRequest(req);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookie(),
    });
    res.end(JSON.stringify({ success: true }));
  } catch (err) {
    console.error('[Auth Middleware] /api/auth/logout error:', err);
    sendJsonResponse(res, 500, {
      error: 'DB_CONNECTION_ERROR',
      message: 'Unable to sign out at this time.',
      details: err.message,
    });
  }
}

/**
 * Verify user session from request
 */
export async function verifySession(req, res) {
  try {
    await connectMongo();
    const sessionData = await getSessionFromRequest(req);
    if (!sessionData || !sessionData.user) {
      sendJsonResponse(res, 401, { error: 'UNAUTHORIZED' });
      return null;
    }
    return sessionData;
  } catch (err) {
    console.error('[Auth Middleware] Session verification error:', err);
    sendJsonResponse(res, 500, { error: 'SERVER_ERROR' });
    return null;
  }
}
