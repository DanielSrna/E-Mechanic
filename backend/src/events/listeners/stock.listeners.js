import eventEmitter from '../eventEmitter.js';
import { sendInvoiceEmail } from '../../services/email.service.js';
import Settings from '../../models/settings.model.js';
import Part from '../../models/part.model.js';
import logger from '../../utils/logger.js';

eventEmitter.on('inventory:low-stock', async ({ partId, sku, name, stock, minStock }) => {
  logger.contexto('Alerta stock bajo: %s (%s) — %d/%d', name, sku, stock, minStock);
  try {
    const settings = await Settings.getSettings();
    const adminEmail = settings.companyEmail;
    if (!adminEmail) {
      logger.proceso('Sin email de admin configurado. Alerta no enviada.');
      return;
    }
    const result = await sendInvoiceEmail({
      invoiceNumber: `STOCK-ALERT-${sku}`,
      order: { _id: 'N/A', entryReason: 'Alerta automática de stock bajo' },
      client: { name: 'Administrador' },
      motorcycle: { plate: sku, brand: name, model: `Stock: ${stock}/${minStock}` },
      total: 0,
      sentToEmail: adminEmail,
      company: {
        companyName: settings.companyName || settings.appName || 'E-Mechanic',
        primaryColor: settings.primaryColor || '#2563eb',
      },
    }, Buffer.from('Alerta de stock bajo'));
    if (result.success) {
      logger.exito('Alerta de stock bajo enviada a %s', adminEmail);
    }
  } catch (error) {
    logger.fracaso('Error enviando alerta stock: %s', error.message);
  }
});

logger.exito('Listeners de stock cargados');
