import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkOrder',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    motorcycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Motorcycle',
      required: true,
    },
    subtotalParts: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotalLabor: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    sentToEmail: {
      type: String,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['generated', 'sent', 'failed'],
      default: 'generated',
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
