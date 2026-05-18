import eventEmitter from '../eventEmitter.js';
import Invoice from '../../models/invoice.model.js';
import Settings from '../../models/settings.model.js';
import { generateInvoicePDF } from '../../services/pdf.service.js';
import { sendInvoiceEmail } from '../../services/email.service.js';
import logger from '../../utils/logger.js';

eventEmitter.on('order:closed', async ({ orderId, clientEmail, orderData }) => {
  logger.contexto('Evento order:closed recibido para orden %s', orderId);

  try {
    const invoiceNumber = await Invoice.generateInvoiceNumber();
    const settings = await Settings.getSettings();
    const company = {
      name: settings.appName || 'E-Mechanic',
      companyName: settings.companyName || 'E-Mechanic Taller',
      nit: settings.companyNit || '123456789-0',
      address: settings.companyAddress || '',
      phone: settings.companyPhone || '',
      email: settings.companyEmail || '',
      primaryColor: settings.primaryColor || '#2563eb',
      logo: settings.logo || null,
    };

    logger.proceso('Creando registro de factura %s...', invoiceNumber);
    const invoice = await Invoice.create({
      invoiceNumber,
      order: orderData._id,
      client: orderData.client?._id,
      motorcycle: orderData.motorcycle?._id,
      subtotalParts: orderData.subtotalParts,
      subtotalLabor: orderData.subtotalLabor,
      tax: orderData.tax,
      total: orderData.total,
      sentToEmail: clientEmail || orderData.client?.email,
      status: 'generated',
    });

    logger.proceso('Generando PDF para factura %s...', invoiceNumber);
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber,
      order: orderData,
      client: orderData.client || {},
      motorcycle: orderData.motorcycle || {},
      subtotalParts: orderData.subtotalParts,
      subtotalLabor: orderData.subtotalLabor,
      tax: orderData.tax,
      total: orderData.total,
      sentToEmail: invoice.sentToEmail,
      company,
    });

    if (invoice.sentToEmail) {
      logger.proceso('Enviando factura por email a %s...', invoice.sentToEmail);
      const emailResult = await sendInvoiceEmail(
        {
          invoiceNumber,
          order: orderData,
          client: orderData.client || {},
          motorcycle: orderData.motorcycle || {},
          total: orderData.total,
          sentToEmail: invoice.sentToEmail,
          company,
        },
        pdfBuffer
      );

      if (emailResult.success) {
        invoice.status = 'sent';
        invoice.sentAt = new Date();
        logger.exito('Factura %s enviada exitosamente', invoiceNumber);
      } else {
        invoice.status = 'failed';
        logger.fracaso(
          'Factura %s generada pero email falló: %s',
          invoiceNumber,
          emailResult.reason
        );
      }
    } else {
      logger.proceso(
        'Cliente sin email registrado. Factura %s queda como generada.',
        invoiceNumber
      );
    }

    await invoice.save();

    eventEmitter.emit('invoice:created', {
      invoiceId: invoice._id,
      invoiceNumber,
      orderId,
      status: invoice.status,
    });
  } catch (error) {
    logger.fracaso(
      'Error procesando factura para orden %s: %s',
      orderId,
      error.message
    );
    eventEmitter.emit('invoice:failed', { orderId, error: error.message });
  }
});

logger.exito('Listeners de órdenes cargados');
