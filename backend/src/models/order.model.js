import mongoose from 'mongoose';

export const ORDER_STATUSES = [
  'ingresada',
  'en_revision',
  'esperando_aprobacion',
  'esperando_repuestos',
  'en_reparacion',
  'lista_entrega',
  'entregada',
  'cancelada',
];

export const VALID_TRANSITIONS = {
  ingresada: ['en_revision', 'cancelada'],
  en_revision: ['esperando_aprobacion', 'esperando_repuestos', 'cancelada'],
  esperando_aprobacion: ['en_reparacion', 'cancelada'],
  esperando_repuestos: ['en_reparacion', 'cancelada'],
  en_reparacion: ['lista_entrega', 'cancelada'],
  lista_entrega: ['entregada', 'cancelada'],
  entregada: [],
  cancelada: [],
};

const orderPartsSchema = new mongoose.Schema(
  {
    part: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Part',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderLaborSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderFindingsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    motorcycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Motorcycle',
      required: true,
      index: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    mechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'ingresada',
    },
    entryReason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    diagnosis: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },
    partsUsed: {
      type: [orderPartsSchema],
      default: [],
    },
    labor: {
      type: [orderLaborSchema],
      default: [],
    },
    findings: {
      type: [orderFindingsSchema],
      default: [],
    },
    subtotalParts: {
      type: Number,
      default: 0,
      min: 0,
    },
    subtotalLabor: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

orderSchema.index({ status: 1 });
orderSchema.index({ mechanic: 1 });
orderSchema.index({ createdAt: -1 });

const WorkOrder = mongoose.model('WorkOrder', orderSchema);
export default WorkOrder;
