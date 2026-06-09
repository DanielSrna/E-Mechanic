import eventEmitter from '../eventEmitter.js';
import { sendStockAlertEmail } from '../../services/email.service.js';
import Settings from '../../models/settings.model.js';
import logger from '../../utils/logger.js';

eventEmitter.on(
  'inventory:low-stock',
  async ({ sku, name, stock, minStock }) => {
    logger.contexto(
      'Alerta stock bajo: %s (%s) — %d/%d',
      name,
      sku,
      stock,
      minStock
    );
    try {
      const settings = await Settings.getSettings();
      const adminEmail = settings.companyEmail;
      if (!adminEmail) {
        logger.proceso('Sin email de admin configurado. Alerta no enviada.');
        return;
      }
      const result = await sendStockAlertEmail({
        sku,
        name,
        stock,
        minStock,
        adminEmail,
        appName: settings.appName,
        primaryColor: settings.primaryColor,
      });
      if (result.success) {
        logger.exito('Alerta de stock bajo enviada a %s', adminEmail);
      }
    } catch (error) {
      logger.fracaso('Error enviando alerta stock: %s', error.message);
    }
  }
);

logger.exito('Listeners de stock cargados');
