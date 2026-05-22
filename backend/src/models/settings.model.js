import mongoose from 'mongoose';

const serviceTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    capacityUnits: {
      type: Number,
      required: true,
      min: 0.5,
    },
    estimatedDays: {
      type: Number,
      required: true,
      min: 0.5,
    },
    examples: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      default: 'E-Mechanic',
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    primaryColor: {
      type: String,
      default: '#2563eb',
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    secondaryColor: {
      type: String,
      default: '#1e293b',
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    accentColor: {
      type: String,
      default: '#f59e0b',
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    companyName: {
      type: String,
      default: 'E-Mechanic Taller',
      trim: true,
    },
    companyNit: {
      type: String,
      default: '123456789-0',
      trim: true,
    },
    companyAddress: {
      type: String,
      default: 'Calle 123 #45-67, Bogotá',
      trim: true,
    },
    companyPhone: {
      type: String,
      default: '300 123 4567',
      trim: true,
    },
    companyEmail: {
      type: String,
      default: 'contacto@emechanic.com',
      trim: true,
    },
    serviceTypes: {
      type: [serviceTypeSchema],
      default: [
        {
          name: 'rapido',
          label: 'Rápido',
          capacityUnits: 0.5,
          estimatedDays: 0.5,
          examples: 'Cambio de aceite, ajuste de cadena, cambio de guaya',
        },
        {
          name: 'medio',
          label: 'Medio',
          capacityUnits: 1,
          estimatedDays: 1,
          examples: 'Cambio de pastillas, cambio de llanta, ajuste de válvulas',
        },
        {
          name: 'complejo',
          label: 'Complejo',
          capacityUnits: 2,
          estimatedDays: 2,
          examples: 'Falla eléctrica, transmisión, mantenimiento general',
        },
        {
          name: 'especial',
          label: 'Especial',
          capacityUnits: 3,
          estimatedDays: 3,
          examples: 'Restauración, pintura, motor completo',
        },
      ],
    },
    dailyCapacityUnits: {
      type: Number,
      default: 6,
      min: 1,
      max: 20,
    },
  },
  { timestamps: true }
);

settingsSchema.statics.getSettings = async function () {
  return await this.findOneAndUpdate(
    {},
    { $setOnInsert: {} },
    { upsert: true, returnDocument: 'after' }
  );
};

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
