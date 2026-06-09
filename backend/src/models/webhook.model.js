import mongoose from 'mongoose';

const webhookSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    events: {
      type: [String],
      required: true,
      validate: {
        validator: (v) =>
          v.length > 0 &&
          v.every((e) =>
            [
              'order:closed',
              'order:statusChanged',
              'inventory:low-stock',
              'invoice:created',
            ].includes(e)
          ),
        message: 'events must be a non-empty array of valid event names',
      },
    },
    secret: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    failCount: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

webhookSchema.index({ isActive: 1, events: 1 });

const Webhook = mongoose.model('Webhook', webhookSchema);
export default Webhook;
