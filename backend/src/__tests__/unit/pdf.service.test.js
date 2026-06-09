import { describe, it, expect } from '@jest/globals';
import { generateInvoicePDF } from '../../services/pdf.service.js';

describe('PDF Service', () => {
  const baseInvoice = {
    invoiceNumber: 'FAC-2026-001',
    subtotalParts: 80000,
    subtotalLabor: 50000,
    tax: 24700,
    total: 154700,
    client: { name: 'Pedro Ramírez', phone: '3001112233', email: 'pedro@email.com', address: 'Carrera 50 #123-45' },
    company: { companyName: 'MotoTaller Express', nit: '900123456-7', address: 'Calle 80 #20-30', phone: '6015551234', email: 'info@mototaller.com', primaryColor: '#2563eb' },
    motorcycle: { plate: 'ABC123', brand: 'Yamaha', model: 'FZ-16', year: 2023, mileage: 15000 },
    order: {
      _id: '507f1f77bcf86cd799439011',
      entryReason: 'Mantenimiento general',
      partsUsed: [
        { part: { name: 'Aceite 20W50' }, quantity: 1, unitPrice: 45000 },
        { part: { name: 'Filtro de aire' }, quantity: 1, unitPrice: 35000 },
      ],
      labor: [
        { description: 'Cambio de aceite', cost: 30000 },
        { description: 'Revisión general', cost: 20000 },
      ],
      findings: [
        { title: 'Cadena desgastada', description: 'Requiere cambio en próxima visita' },
      ],
    },
  };

  it('retorna un Buffer', async () => {
    const buffer = await generateInvoicePDF(baseInvoice);
    expect(Buffer.isBuffer(buffer)).toBe(true);
  });

  it('el buffer no está vacío y es un PDF válido', async () => {
    const buffer = await generateInvoicePDF(baseInvoice);
    expect(buffer.length).toBeGreaterThan(100);
    expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
  });

  it('PDF con invoice completo es más grande que uno mínimo', async () => {
    const full = await generateInvoicePDF(baseInvoice);
    const minimal = await generateInvoicePDF({
      ...baseInvoice, subtotalParts: 0, subtotalLabor: 0, tax: 0, total: 0,
      order: { ...baseInvoice.order, partsUsed: [], labor: [], findings: [] },
    });
    expect(full.length).toBeGreaterThan(minimal.length);
  });

  it('maneja invoice sin repuestos ni labor', async () => {
    const minimal = { ...baseInvoice, subtotalParts: 0, subtotalLabor: 0, tax: 0, total: 0 };
    minimal.order = { ...baseInvoice.order, partsUsed: [], labor: [], findings: [] };
    const buffer = await generateInvoicePDF(minimal);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(100);
  });

  it('maneja company sin datos (usa defaults)', async () => {
    const noCompany = { ...baseInvoice, company: {} };
    noCompany.order = { ...baseInvoice.order };
    const buffer = await generateInvoicePDF(noCompany);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(100);
  });

  it('maneja invoice con findings pero sin parts/labor', async () => {
    const findingsOnly = { ...baseInvoice, subtotalParts: 0, subtotalLabor: 0, tax: 0, total: 0 };
    findingsOnly.order = { ...baseInvoice.order, partsUsed: [], labor: [], findings: [{ title: 'Falla eléctrica', description: 'Corto en arnés' }] };
    const buffer = await generateInvoicePDF(findingsOnly);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(100);
  });

  it('PDF con findings ocupa más que PDF sin findings', async () => {
    const noFindings = await generateInvoicePDF({
      ...baseInvoice, subtotalParts: 0, subtotalLabor: 0, tax: 0, total: 0,
      order: { _id: '1', entryReason: 'test', partsUsed: [], labor: [], findings: [] },
    });
    const withFindings = await generateInvoicePDF({
      ...baseInvoice, subtotalParts: 0, subtotalLabor: 0, tax: 0, total: 0,
      order: { _id: '2', entryReason: 'test', partsUsed: [], labor: [],
        findings: [{ title: 'Falla eléctrica', description: 'Corto en arnés principal' }] },
    });
    expect(withFindings.length).toBeGreaterThan(noFindings.length);
  });
});
