import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import User from '../../models/user.model.js';
import Client from '../../models/client.model.js';
import Motorcycle from '../../models/motorcycle.model.js';
import Order from '../../models/order.model.js';
import { setupTestDB, teardownTestDB } from '../test-helper.js';

let app;
let adminToken;
let clientId;
let motorcycleId;

beforeAll(async () => {
  await setupTestDB();
  app = (await import('../../../app.js')).default;

  await User.create({
    name: 'Admin',
    email: 'admin.stat@test.dev',
    cedula: '1111111111',
    password: 'admin123',
    rol: 'admin',
  });
  const login = await request(app)
    .post('/api/users/login')
    .send({ email: 'admin.stat@test.dev', password: 'admin123' });
  adminToken = login.body.accessToken;

  const client = await Client.create({
    name: 'Stat Client',
    phone: '3002222222',
  });
  clientId = client._id;

  const moto = await Motorcycle.create({
    plate: 'STAT001',
    brand: 'Honda',
    model: 'CBR 250',
    year: 2024,
    mileage: 0,
    client: clientId,
  });
  motorcycleId = moto._id;

  const mechanic = await User.create({
    name: 'Stat Mech',
    email: 'statmech@test.dev',
    cedula: '2222222223',
    password: 'mec123456',
    rol: 'mecanico',
  });

  await Order.create({
    motorcycle: motorcycleId,
    client: clientId,
    mechanic: mechanic._id,
    entryReason: 'Test stats',
    status: 'entregada',
    subtotalParts: 60000,
    subtotalLabor: 80000,
    total: 166400,
    isClosed: true,
  });
}, 30000);

afterAll(async () => {
  await teardownTestDB();
}, 15000);

describe('Stats API', () => {
  describe('GET /api/stats/overview', () => {
    it('retorna overview con métricas principales', async () => {
      const res = await request(app)
        .get('/api/stats/overview')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(typeof res.body.totalClients).toBe('number');
      expect(typeof res.body.totalOrders).toBe('number');
    });
  });

  describe('GET /api/stats/revenue', () => {
    it('retorna revenue mensual por defecto', async () => {
      const res = await request(app)
        .get('/api/stats/revenue')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(Array.isArray(res.body.labels)).toBe(true);
      expect(Array.isArray(res.body.revenue)).toBe(true);
    });

    it('acepta parámetro period', async () => {
      const res = await request(app)
        .get('/api/stats/revenue?period=weekly')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/stats/mechanic-productivity', () => {
    it('retorna productividad por mecánico', async () => {
      const res = await request(app)
        .get('/api/stats/mechanic-productivity')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.mechanics).toBeDefined();
    });
  });

  describe('GET /api/stats/most-used-parts', () => {
    it('retorna lista de repuestos más usados', async () => {
      const res = await request(app)
        .get('/api/stats/most-used-parts')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.parts).toBeDefined();
      expect(Array.isArray(res.body.parts)).toBe(true);
    });
  });

  describe('GET /api/stats/order-status-distribution', () => {
    it('retorna distribución de estados', async () => {
      const res = await request(app)
        .get('/api/stats/order-status-distribution')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.labels).toBeDefined();
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/stats/mechanics/:id', () => {
    it('retorna stats de un mecánico específico', async () => {
      const mechanic = await User.findOne({ email: 'statmech@test.dev' });
      const res = await request(app)
        .get(`/api/stats/mechanics/${mechanic._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.mechanic).toBeDefined();
    });
  });

  describe('auth - no admin no puede ver stats', () => {
    it('rechaza no admin con 403', async () => {
      await User.create({
        name: 'No Admin',
        email: 'noadmin.stat@test.dev',
        cedula: '3333333333',
        password: 'mec123456',
        rol: 'mecanico',
      });
      const login = await request(app)
        .post('/api/users/login')
        .send({ email: 'noadmin.stat@test.dev', password: 'mec123456' });

      const res = await request(app)
        .get('/api/stats/overview')
        .set('Authorization', `Bearer ${login.body.accessToken}`);
      expect(res.status).toBe(403);
    });
  });
});
