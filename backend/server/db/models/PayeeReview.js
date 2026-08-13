import mongoose from 'mongoose';

export const PAYEE_REVIEW_STATUSES = [
  'PENDING_REVIEW',
  'REVIEWED',
  'CLEARED',
  'HELD',
  'ESCALATED',
];

const payeeReviewSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    reviewStatus: {
      type: String,
      required: true,
      enum: PAYEE_REVIEW_STATUSES,
    },
    reviewedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: 'payeeReviews',
  }
);

payeeReviewSchema.index({ transactionId: 1 }, { unique: true });
payeeReviewSchema.index({ reviewStatus: 1 });
payeeReviewSchema.index({ reviewedByUserId: 1, updatedAt: -1 });

export const PayeeReview =
  mongoose.models.PayeeReview || mongoose.model('PayeeReview', payeeReviewSchema);
