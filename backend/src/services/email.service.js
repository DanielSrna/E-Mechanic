import nodemailer from 'nodemailer';
import { env } from '../config/env.config.js';
import logger from '../utils/logger.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    logger.fracaso(
      'SMTP no configurado. Define SMTP_HOST, SMTP_USER y SMTP_PASS en .env. Los emails no se enviarán.'
    );
    return null;
  }

  const host = env.SMTP_HOST;
  const port = env.SMTP_PORT || 587;
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS;

  logger.proceso('Configurando transporte SMTP: %s:%d', host, port);

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendInvoiceEmail(invoiceData, pdfBuffer) {
  logger.contexto('Enviando factura por email a %s', invoiceData.sentToEmail);

  const transport = getTransporter();

  if (!transport) {
    return { success: false, reason: 'smtp_not_configured' };
  }

  const { invoiceNumber, order, client, motorcycle, total, company } =
    invoiceData;
  const appName = company?.companyName || company?.name || 'E-Mechanic';
  const totalFormatted = `$${Number(total).toLocaleString('es-CO')}`;

  const mailOptions = {
    from: `"${appName}" <${env.SMTP_USER || 'no-reply@emechanic.com'}>`,
    to: invoiceData.sentToEmail,
    subject: `Factura ${invoiceNumber} - ${appName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <div style="background:${company?.primaryColor || '#2563eb'};color:white;padding:24px;text-align:center">
          <h1 style="margin:0;font-size:24px">${appName.toUpperCase()}</h1>
          <p style="margin:4px 0 0;font-size:14px;opacity:0.9">Taller de Motocicletas</p>
        </div>
        <div style="padding:24px">
          <h2 style="color:#1e293b;margin:0 0 16px">Factura Electrónica ${invoiceNumber}</h2>
          <p style="color:#475569;margin:0 0 24px">
            Hola <strong>${client?.name || 'Cliente'}</strong>,
            tu motocicleta <strong>${motorcycle?.brand || ''} ${motorcycle?.model || ''} (${motorcycle?.plate || ''})</strong>
            que pasó por <em>"${order?.entryReason || 'reparación'}"</em> fue reparada.
          </p>
          ${
            order?.findings?.length
              ? `<div style="margin-bottom:24px">
                  <h3 style="color:#1e293b;font-size:14px;margin:0 0 8px">Reparación de los siguientes hallazgos:</h3>
                  ${order.findings.map((f) => `<p style="color:#475569;font-size:13px;margin:2px 0">• <strong>${f.title}</strong>${f.description ? ` — ${f.description}` : ''}</p>`).join('')}
                </div>`
              : ''
          }
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:8px;color:#64748b">Orden de Trabajo</td><td style="padding:8px;text-align:right;font-weight:600">${order?._id || 'N/A'}</td></tr>
            <tr><td style="padding:8px;color:#64748b">Fecha</td><td style="padding:8px;text-align:right;font-weight:600">${new Date().toLocaleDateString('es-CO')}</td></tr>
          </table>
          <div style="background:#f1f5f9;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px">
            <p style="color:#475569;margin:0 0 4px;font-size:14px">Total pagado</p>
            <p style="color:#1e293b;margin:0;font-size:32px;font-weight:700">${totalFormatted}</p>
          </div>
          <p style="color:#64748b;font-size:12px;margin:0 0 4px">La factura detallada en PDF se adjunta a este correo.</p>
          <p style="color:#64748b;font-size:12px;margin:0 0 24px">Gracias por confiar en ${appName}.</p>
          <div style="border-top:1px solid #e5e7eb;padding-top:16px">
            <p style="color:#94a3b8;font-size:11px;margin:0;text-align:center">${appName} &copy; ${new Date().getFullYear()} | Documento generado electrónicamente</p>
          </div>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  try {
    logger.proceso('Enviando email...');
    const info = await sendWithRetry(transport, mailOptions);
    logger.exito('Email enviado: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.fracaso('Error enviando email tras reintentos: %s', error.message);
    return { success: false, reason: error.message };
  }
}

async function sendWithRetry(transport, mailOptions, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await transport.sendMail(mailOptions);
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        logger.proceso('Reintento %d de email en %dms...', attempt, delay);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

export async function verifySMTPConnection() {
  const transport = getTransporter();
  if (!transport) return false;
  try {
    await transport.verify();
    logger.exito('Conexión SMTP verificada exitosamente');
    return true;
  } catch (error) {
    logger.fracaso('Error verificando SMTP: %s', error.message);
    return false;
  }
}
