import mongoose from 'mongoose';

const partSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    minStock: {
      type: Number,
      default: 5,
      min: 0,
    },
  },
  { timestamps: true }
);

partSchema.pre('save', function () {
  if (this.name) {
    this.name = this.name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  if (this.brand) {
    this.brand = this.brand
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
});

const Part = mongoose.model('Part', partSchema);
export default Part;
