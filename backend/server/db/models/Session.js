import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastSeenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'sessions',
  }
);

sessionSchema.index({ tokenHash: 1 }, { unique: true });
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session =
  mongoose.models.Session || mongoose.model('Session', sessionSchema);
