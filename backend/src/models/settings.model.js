import mongoose from 'mongoose';

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
  },
  { timestamps: true }
);

settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
