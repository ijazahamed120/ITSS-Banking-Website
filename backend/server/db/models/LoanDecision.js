import mongoose from 'mongoose';

export const LOAN_DECISION_STATUSES = [
  'APPROVED',
  'REJECTED',
  'REFER_FOR_REVIEW',
];

const loanDecisionSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    decisionStatus: {
      type: String,
      required: true,
      enum: LOAN_DECISION_STATUSES,
    },
    decidedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    decidedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: 'loanDecisions',
  }
);

loanDecisionSchema.index({ applicationId: 1 }, { unique: true });
loanDecisionSchema.index({ decisionStatus: 1 });
loanDecisionSchema.index({ decidedByUserId: 1, updatedAt: -1 });

export const LoanDecision =
  mongoose.models.LoanDecision || mongoose.model('LoanDecision', loanDecisionSchema);
