import mongoose from 'mongoose';

const motorcycleSchema = new mongoose.Schema(
  {
    plate: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z0-9]{3,10}$/,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1950,
      max: new Date().getFullYear() + 1,
    },
    mileage: {
      type: Number,
      required: true,
      min: 0,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

motorcycleSchema.pre('save', function () {
  if (this.brand) {
    this.brand = this.brand
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  if (this.model) {
    this.model = this.model.charAt(0).toUpperCase() + this.model.slice(1);
  }
});

const Motorcycle = mongoose.model('Motorcycle', motorcycleSchema);
export default Motorcycle;
