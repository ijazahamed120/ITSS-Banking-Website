import mongoose from 'mongoose';

const auditEventSchema = new mongoose.Schema(
  {legacyId: {
  type: String,
  trim: true,
},
    workflow: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    actingUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actingUserName: {
      type: String,
      required: true,
      trim: true,
    },
    actingUserEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    actingUserRole: {
      type: String,
      required: true,
      trim: true,
    },
    previousStatus: {
      type: String,
      trim: true,
      default: null,
    },
    newStatus: {
      type: String,
      trim: true,
      default: null,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: 'auditEvents',
  }
);

auditEventSchema.index({ entityId: 1, createdAt: -1 });
auditEventSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditEventSchema.index({ workflow: 1, createdAt: -1 });
auditEventSchema.index({ actingUserId: 1, createdAt: -1 });
auditEventSchema.index({ createdAt: -1 });
auditEventSchema.index(
  { legacyId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      legacyId: { $type: 'string' },
    },
  }
);

export const AuditEvent =
  mongoose.models.AuditEvent || mongoose.model('AuditEvent', auditEventSchema);
