import { connectMongo } from '../server/db/connect.js';
import { AuditEvent } from '../server/db/index.js';
import { parseJsonBody } from '../server/auth.js';
import { verifySession } from '../middleware/authMiddleware.js';
import { sendJsonResponse } from '../middleware/corsMiddleware.js';

/**
 * Create audit event for E1 workflow
 */
export async function createE1Action(req, res) {
  const sessionData = await verifySession(req, res);
  if (!sessionData) return;

  try {
    const body = await parseJsonBody(req);
    const { txnId, action, previousStatus, newStatus } = body;

    if (!txnId || !action || !newStatus) {
      sendJsonResponse(res, 400, { error: 'MISSING_FIELDS' });
      return;
    }

    const auditEvent = await AuditEvent.create({
      workflow: 'E1_SUSPICIOUS_TRANSFERS',
      entityType: 'TRANSACTION',
      entityId: String(txnId).toUpperCase(),
      action,
      actingUserId: sessionData.user._id,
      actingUserName: sessionData.user.name,
      actingUserEmail: sessionData.user.email,
      actingUserRole: sessionData.user.role,
      previousStatus: previousStatus || null,
      newStatus,
    });

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ event: auditEvent }));
  } catch (err) {
    console.error('[E1 Routes] Create action error:', err);
    sendJsonResponse(res, 500, { error: 'SERVER_ERROR' });
  }
}

/**
 * Get all E1 audit events
 */
export async function getE1Actions(req, res) {
  const sessionData = await verifySession(req, res);
  if (!sessionData) return;

  try {
    const events = await AuditEvent.find({ workflow: 'E1_SUSPICIOUS_TRANSFERS' })
      .sort({ createdAt: -1 })
      .lean();

    sendJsonResponse(res, 200, { events });
  } catch (err) {
    console.error('[E1 Routes] Get actions error:', err);
    sendJsonResponse(res, 500, { error: 'SERVER_ERROR' });
  }
}
