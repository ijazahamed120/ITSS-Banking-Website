import { connectMongo } from '../server/db/connect.js';
import { LoanDecision } from '../server/db/index.js';
import { parseJsonBody } from '../server/auth.js';
import { verifySession } from '../middleware/authMiddleware.js';
import { sendJsonResponse } from '../middleware/corsMiddleware.js';

/**
 * Create or update loan decision
 */
export async function createE3Decision(req, res) {
  const sessionData = await verifySession(req, res);
  if (!sessionData) return;

  try {
    const body = await parseJsonBody(req);
    const { applicationId, decision } = body;

    if (!applicationId || !decision) {
      sendJsonResponse(res, 400, { error: 'MISSING_FIELDS' });
      return;
    }

    const updated = await LoanDecision.findOneAndUpdate(
      { applicationId: String(applicationId).toUpperCase() },
      {
        applicationId: String(applicationId).toUpperCase(),
        decisionStatus: decision,
        decidedByUserId: sessionData.user._id,
      },
      { upsert: true, new: true }
    );

    sendJsonResponse(res, 200, { decision: updated });
  } catch (err) {
    console.error('[E3 Routes] Create decision error:', err);
    sendJsonResponse(res, 500, { error: 'SERVER_ERROR' });
  }
}

/**
 * Get all loan decisions
 */
export async function getE3Decisions(req, res) {
  const sessionData = await verifySession(req, res);
  if (!sessionData) return;

  try {
    const decisions = await LoanDecision.find({}).lean();
    const decisionMap = {};
    decisions.forEach((d) => {
      decisionMap[d.applicationId] = d.decisionStatus;
    });

    sendJsonResponse(res, 200, { decisions: decisionMap });
  } catch (err) {
    console.error('[E3 Routes] Get decisions error:', err);
    sendJsonResponse(res, 500, { error: 'SERVER_ERROR' });
  }
}
