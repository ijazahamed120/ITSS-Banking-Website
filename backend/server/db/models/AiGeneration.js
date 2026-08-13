import mongoose from 'mongoose';

export const AI_WORKFLOWS = ['E1', 'E2', 'E3', 'E4', 'E5'];

const aiGenerationSchema = new mongoose.Schema(
  {
    workflow: {
      type: String,
      required: true,
      enum: AI_WORKFLOWS,
    },
    entityId: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },
    requestedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    modelUsed: {
      type: String,
      required: true,
      trim: true,
    },
    fallback: {
      type: Boolean,
      required: true,
      default: false,
    },
    content: {
      type: String,
      required: true,
    },
    disclaimer: {
      type: String,
      trim: true,
      default: null,
    },
    sourceDataVersion: {
      type: String,
      trim: true,
      default: null,
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: 'aiGenerations',
  }
);

aiGenerationSchema.index({ workflow: 1, entityId: 1, generatedAt: -1 });
aiGenerationSchema.index({ generatedAt: -1 });
aiGenerationSchema.index({ requestedByUserId: 1, generatedAt: -1 });

export const AiGeneration =
  mongoose.models.AiGeneration || mongoose.model('AiGeneration', aiGenerationSchema);
