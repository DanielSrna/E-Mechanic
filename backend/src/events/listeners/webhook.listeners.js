import { createHmac } from 'node:crypto';
import eventEmitter from '../eventEmitter.js';
import Webhook from '../../models/webhook.model.js';
import logger from '../../utils/logger.js';

async function sendToWebhook(webhook, payload) {
  const body = JSON.stringify(payload);
  const signature = createHmac('sha256', webhook.secret)
    .update(body)
    .digest('hex');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-E-Mechanic-Signature': signature,
        'X-E-Mechanic-Event': payload.event,
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    webhook.lastSentAt = new Date();
    webhook.failCount = 0;
    await webhook.save();
    logger.exito('Webhook %s enviado a %s', payload.event, webhook.url);
  } catch (error) {
    webhook.failCount = (webhook.failCount || 0) + 1;
    await webhook.save();
    logger.fracaso(
      'Webhook falló: %s → %s (%s)',
      payload.event,
      webhook.url,
      error.message
    );

    if (webhook.failCount <= 2) {
      const delay = webhook.failCount === 1 ? 1000 : 3000;
      setTimeout(() => {
        sendToWebhook(webhook, payload);
      }, delay);
    }
  }
}

async function notifyWebhooks(event, payload) {
  try {
    const webhooks = await Webhook.find({ isActive: true, events: event });
    if (webhooks.length === 0) return;

    const fullPayload = {
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    };

    for (const webhook of webhooks) {
      sendToWebhook(webhook, fullPayload);
    }
  } catch (error) {
    logger.fracaso('Error notificando webhooks: ', error);
  }
}

eventEmitter.on('order:closed', async ({ orderId, clientEmail, orderData }) => {
  await notifyWebhooks('order:closed', {
    orderId,
    clientEmail: clientEmail || orderData?.client?.email,
    motorcycle: orderData?.motorcycle?.plate,
    client: orderData?.client?.name,
    total: orderData?.total,
  });
});

eventEmitter.on(
  'invoice:created',
  async ({ invoiceId, invoiceNumber, orderId, status }) => {
    await notifyWebhooks('invoice:created', {
      invoiceId,
      invoiceNumber,
      orderId,
      status,
    });
  }
);

eventEmitter.on(
  'inventory:low-stock',
  async ({ sku, name, stock, minStock }) => {
    await notifyWebhooks('inventory:low-stock', { sku, name, stock, minStock });
  }
);

eventEmitter.on(
  'order:statusChanged',
  async ({ orderId, oldStatus, newStatus, motorcycle, client }) => {
    await notifyWebhooks('order:statusChanged', {
      orderId,
      oldStatus,
      newStatus,
      motorcycle,
      client,
    });
  }
);

logger.exito('Listeners de webhooks cargados');
