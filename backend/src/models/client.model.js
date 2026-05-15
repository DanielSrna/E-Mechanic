import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^\+?[0-9]{7,15}$/,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: /.+@.+\..+/,
      default: null,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  { timestamps: true }
);

clientSchema.pre('save', function () {
  if (this.name) {
    this.name = this.name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
});

clientSchema.index({ email: 1 });

const Client = mongoose.model('Client', clientSchema);
export default Client;
