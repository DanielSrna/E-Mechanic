import mongoose from 'mongoose';

const jwtSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['refresh', 'resetPassword', 'verifyEmail'],
      required: true,
    },
    deviceInfo: {
      type: String,
      required: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  { timestamps: true }
);

jwtSchema.statics.saveToken = async function (
  userId,
  token,
  type,
  deviceInfo,
  expiresIn
) {
  const expiresAt = new Date(Date.now() + expiresIn);
  return await this.findOneAndUpdate(
    { userId, deviceInfo, type },
    { token, expiresAt },
    {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
};

jwtSchema.statics.deleteToken = async function (userId, deviceInfo, type) {
  return await this.deleteOne({ userId, deviceInfo, type });
};

jwtSchema.statics.deleteTokens = async function (userId, type) {
  return await this.deleteMany({ userId, type });
};

jwtSchema.index({ userId: 1, deviceInfo: 1, type: 1 }, { unique: true });

const JWT = mongoose.model('JWT', jwtSchema);
export default JWT;
