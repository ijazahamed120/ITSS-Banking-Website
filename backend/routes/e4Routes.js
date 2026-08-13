import { connectMongo } from '../server/db/connect.js';
import { PayeeReview } from '../server/db/index.js';
import { parseJsonBody } from '../server/auth.js';
import { verifySession } from '../middleware/authMiddleware.js';
import { sendJsonResponse } from '../middleware/corsMiddleware.js';

/**
 * Create or update payee review
 */
export async function createE4Review(req, res) {
  const sessionData = await verifySession(req, res);
  if (!sessionData) return;

  try {
    const body = await parseJsonBody(req);
    const { transactionId, reviewStatus } = body;

    if (!transactionId || !reviewStatus) {
      sendJsonResponse(res, 400, { error: 'MISSING_FIELDS' });
      return;
    }

    const updated = await PayeeReview.findOneAndUpdate(
      { transactionId: String(transactionId).toUpperCase() },
      {
        transactionId: String(transactionId).toUpperCase(),
        reviewStatus,
        reviewedByUserId: sessionData.user._id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    sendJsonResponse(res, 200, { review: updated });
  } catch (err) {
    console.error('[E4 Routes] Create review error:', err);
    sendJsonResponse(res, 500, { error: 'SERVER_ERROR' });
  }
}

/**
 * Get all payee reviews
 */
export async function getE4Reviews(req, res) {
  const sessionData = await verifySession(req, res);
  if (!sessionData) return;

  try {
    const reviews = await PayeeReview.find({}).lean();
    const reviewMap = {};
    reviews.forEach((r) => {
      reviewMap[r.transactionId] = r.reviewStatus;
    });

    sendJsonResponse(res, 200, { reviews: reviewMap });
  } catch (err) {
    console.error('[E4 Routes] Get reviews error:', err);
    sendJsonResponse(res, 500, { error: 'SERVER_ERROR' });
  }
}
