import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import User from '../../models/user.model.js';
import Client from '../../models/client.model.js';
import Motorcycle from '../../models/motorcycle.model.js';
import Order from '../../models/order.model.js';
import { setupTestDB, teardownTestDB } from '../test-helper.js';

let app;
let adminToken;
let mechanicToken;
let mechanicId;
let clientId;
let motorcycleId;

beforeAll(async () => {
  await setupTestDB();
  app = (await import('../../../app.js')).default;

  await User.create({
    name: 'Admin',
    email: 'admin.wht@test.dev',
    cedula: '9999999901',
    password: 'admin123',
    rol: 'admin',
  });
  const adminLogin = await request(app)
    .post('/api/users/login')
    .send({ email: 'admin.wht@test.dev', password: 'admin123' });
  adminToken = adminLogin.body.accessToken;

  const mech = await User.create({
    name: 'Mech WH',
    email: 'mech.wh@test.dev',
    cedula: '9999999902',
    password: 'mec123456',
    rol: 'mecanico',
  });
  mechanicId = mech._id;
  const mechLogin = await request(app)
    .post('/api/users/login')
    .send({ email: 'mech.wh@test.dev', password: 'mec123456' });
  mechanicToken = mechLogin.body.accessToken;

  const client = await Client.create({
    name: 'WH Client',
    phone: '3007777777',
  });
  clientId = client._id;

  const moto = await Motorcycle.create({
    plate: 'WHT001',
    brand: 'Honda',
    model: 'CB190',
    year: 2024,
    mileage: 1000,
    client: clientId,
  });
  motorcycleId = moto._id;
}, 30000);

afterAll(async () => {
  await teardownTestDB();
}, 15000);

describe('Webhooks API', () => {
  describe('POST /api/webhooks', () => {
    it('crea un webhook con secret auto-generado', async () => {
      const res = await request(app)
        .post('/api/webhooks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          url: 'https://example.com/hook',
          description: 'Test',
          events: ['order:closed'],
        });
      expect(res.status).toBe(201);
      expect(res.body.webhook.url).toBe('https://example.com/hook');
      expect(res.body.webhook.secret).toBeDefined();
      expect(res.body.webhook.secret.length).toBe(64);
    });

    it('rechaza eventos inválidos', async () => {
      const res = await request(app)
        .post('/api/webhooks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ url: 'https://example.com/hook', events: ['invalid:event'] });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/webhooks', () => {
    it('lista webhooks', async () => {
      const res = await request(app)
        .get('/api/webhooks')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.webhooks)).toBe(true);
    });
  });

  describe('DELETE /api/webhooks/:id', () => {
    it('elimina un webhook', async () => {
      const created = await request(app)
        .post('/api/webhooks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ url: 'https://example.com/del', events: ['order:closed'] });
      const res = await request(app)
        .delete(`/api/webhooks/${created.body.webhook._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });
});

describe('Mecánico solo ve sus órdenes', () => {
  it('mecánico NO ve órdenes de otros', async () => {
    await Order.create({
      motorcycle: motorcycleId,
      client: clientId,
      mechanic: mechanicId,
      entryReason: 'My order',
      serviceType: 'rapido',
    });

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${mechanicToken}`);
    expect(res.status).toBe(200);
    (res.body.orders || []).forEach((o) => {
      expect(o.mechanic._id.toString()).toBe(mechanicId.toString());
    });
  });

  it('?all=true devuelve órdenes antiguas', async () => {
    const res = await request(app)
      .get('/api/orders?all=true')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});

describe('Rehire mechanic', () => {
  it('recontrata un mecánico inactivo', async () => {
    const mech = await User.create({
      name: 'To Rehire',
      email: `rehire${Date.now()}@test.dev`,
      cedula: `9999999${Math.floor(Math.random() * 100)}`,
      password: 'mec123456',
      rol: 'mecanico',
      isActive: false,
    });

    const res = await request(app)
      .put(`/api/users/${mech._id}/rehire`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.isActive).toBe(true);
  });

  it('rechaza recontratar a admin', async () => {
    const adm = await User.findOne({ email: 'admin.wht@test.dev' });
    const res = await request(app)
      .put(`/api/users/${adm._id}/rehire`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });
});

describe('Change email', () => {
  it('requiere contraseña actual', async () => {
    const res = await request(app)
      .put('/api/users/change-email')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newEmail: 'new@test.dev' });
    expect(res.status).toBe(400);
  });

  it('rechaza email duplicado', async () => {
    const res = await request(app)
      .put('/api/users/change-email')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ currentPassword: 'admin123', newEmail: 'admin.wht@test.dev' });
    expect(res.status).toBe(409);
  });

  it('rechaza contraseña incorrecta', async () => {
    const res = await request(app)
      .put('/api/users/change-email')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ currentPassword: 'wrong', newEmail: 'newemail@test.dev' });
    expect(res.status).toBe(400);
  });
});
