import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { env } from '../config/env.config.js';
import logger from '../utils/logger.js';

// ── Configuración compartida ──
let smtpTransporter = null;

const FROM_NAME = 'E-Mechanic';
const FROM_EMAIL =
  env.SMTP_USER || env.RESEND_API_KEY
    ? env.SMTP_USER || 'no-reply@emechanic.com'
    : null;
const FROM = FROM_EMAIL ? `"${FROM_NAME}" <${FROM_EMAIL}>` : null;

// ── Detector de proveedor ──
function getProvider() {
  if (env.RESEND_API_KEY) return 'resend';
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) return 'smtp';
  return null;
}

// ── SMTP ──
function getSMTP() {
  if (smtpTransporter) return smtpTransporter;
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;

  smtpTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: (env.SMTP_PORT || 587) === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  return smtpTransporter;
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
        logger.proceso(
          'Reintento %d de email (SMTP) en %dms...',
          attempt,
          delay
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

// ── Resend ──
async function sendWithResend({ to, subject, html, attachments }) {
  const resend = new Resend(env.RESEND_API_KEY);

  const payload = {
    from: FROM || 'E-Mechanic <no-reply@emechanic.com>',
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };

  if (attachments && attachments.length > 0) {
    payload.attachments = attachments.map((a) => ({
      filename: a.filename,
      content: Buffer.isBuffer(a.content)
        ? a.content.toString('base64')
        : a.content,
    }));
  }

  const { data, error } = await resend.emails.send(payload);
  if (error) throw new Error(error.message);
  return { success: true, messageId: data?.id };
}

// ── Envío genérico (elige proveedor automáticamente) ──
async function sendEmail({
  to,
  subject,
  html,
  attachments = [],
  smtpMailOptions = {},
}) {
  const provider = getProvider();

  if (provider === 'resend') {
    try {
      return await sendWithResend({ to, subject, html, attachments });
    } catch (error) {
      logger.fracaso('Resend falló, intentando SMTP: %s', error.message);
    }
  }

  if (provider === 'smtp' || provider === null) {
    const transport = getSMTP();
    if (transport) {
      try {
        const info = await sendWithRetry(transport, {
          from: FROM || 'E-Mechanic <no-reply@emechanic.com>',
          to,
          subject,
          html,
          attachments,
          ...smtpMailOptions,
        });
        logger.exito('Email enviado via SMTP: %s', info.messageId);
        return { success: true, messageId: info.messageId };
      } catch (error) {
        logger.fracaso('Error enviando email via SMTP: %s', error.message);
        return { success: false, reason: error.message };
      }
    }
  }

  logger.fracaso('Ningún proveedor de email configurado.');
  return { success: false, reason: 'no_email_provider_configured' };
}

// ── API pública ──

export async function sendInvoiceEmail(invoiceData, pdfBuffer) {
  logger.contexto('Enviando factura por email a %s', invoiceData.sentToEmail);

  if (!invoiceData.sentToEmail) {
    return { success: false, reason: 'no_recipient_email' };
  }

  const { invoiceNumber, order, client, motorcycle, total, company } =
    invoiceData;
  const appName = company?.companyName || company?.name || 'E-Mechanic';
  const totalFormatted = `$${Number(total).toLocaleString('es-CO')}`;

  const html = `
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
  `;

  return await sendEmail({
    to: invoiceData.sentToEmail,
    subject: `Factura ${invoiceNumber} - ${appName}`,
    html,
    attachments: [{ filename: `${invoiceNumber}.pdf`, content: pdfBuffer }],
  });
}

export async function sendVerificationEmail(to, userName, token) {
  logger.contexto('Enviando email de verificación a %s', to);

  const verifyUrl = `${env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:sans-serif">
      <h1 style="color:#2563eb">E-Mechanic</h1>
      <p>Hola <strong>${userName}</strong>,</p>
      <p>Has solicitado cambiar tu correo electrónico. Haz clic en el botón de abajo para confirmar tu nuevo email:</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Verificar Email</a>
      <p style="margin-top:20px;color:#666;font-size:12px">Si no solicitaste este cambio, ignora este mensaje.</p>
    </div>
  `;

  return await sendEmail({
    to,
    subject: 'Verifica tu nuevo email — E-Mechanic',
    html,
  });
}

export async function sendStockAlertEmail({ sku, name, stock, minStock, adminEmail, appName, primaryColor }) {
  logger.contexto('Enviando alerta de stock bajo: %s (%s)', name, sku);

  if (!adminEmail) {
    return { success: false, reason: 'no_admin_email' };
  }

  const displayName = appName || 'E-Mechanic';
  const color = primaryColor || '#2563eb';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:${color};color:white;padding:24px;text-align:center">
        <h1 style="margin:0;font-size:24px">${displayName.toUpperCase()}</h1>
        <p style="margin:4px 0 0;font-size:14px;opacity:0.9">Alerta de Inventario</p>
      </div>
      <div style="padding:24px">
        <h2 style="color:#1e293b;margin:0 0 16px">⚠ Stock Bajo</h2>
        <p style="color:#475569;margin:0 0 24px">
          El repuesto <strong>${name}</strong> (SKU: ${sku}) ha alcanzado su nivel mínimo de stock.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#fef2f2;border-radius:8px">
          <tr><td style="padding:12px;color:#991b1b;font-weight:600">Stock actual</td><td style="padding:12px;text-align:right;font-weight:700;color:#991b1b">${stock}</td></tr>
          <tr><td style="padding:12px;color:#991b1b">Stock mínimo</td><td style="padding:12px;text-align:right;color:#991b1b">${minStock}</td></tr>
        </table>
        <p style="color:#64748b;font-size:12px;margin:0">Revisa tu inventario y reabastece este repuesto lo antes posible.</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: adminEmail,
    subject: `[STOCK BAJO] ${name} — ${stock}/${minStock} unidades`,
    html,
  });
}

export async function verifySMTPConnection() {
  const transport = getSMTP();
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
