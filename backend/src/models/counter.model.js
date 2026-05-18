import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

export async function getNextInvoiceNumber() {
  const year = new Date().getFullYear();
  const doc = await Counter.findOneAndUpdate(
    { _id: `invoice-${year}` },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  const nextNumber = String(doc.seq).padStart(6, '0');
  return `FEM-${year}-${nextNumber}`;
}
