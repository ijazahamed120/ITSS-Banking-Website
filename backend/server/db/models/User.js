import mongoose from 'mongoose';

export const USER_ROLES = [
  'ADMIN',
  'COMPLIANCE_OFFICER',
  'RISK_ANALYST',
  'AUDITOR',
];

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: USER_ROLES,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ employeeId: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });

export const User =
  mongoose.models.User || mongoose.model('User', userSchema);
