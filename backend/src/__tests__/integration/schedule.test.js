import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import User from '../../models/user.model.js';
import Client from '../../models/client.model.js';
import Motorcycle from '../../models/motorcycle.model.js';
import Order from '../../models/order.model.js';
import Settings from '../../models/settings.model.js';
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
    email: 'admin.sched@test.dev',
    cedula: '1212121212',
    password: 'admin123',
    rol: 'admin',
  });
  const login = await request(app)
    .post('/api/users/login')
    .send({ email: 'admin.sched@test.dev', password: 'admin123' });
  adminToken = login.body.accessToken;

  const client = await Client.create({
    name: 'Sched Client',
    phone: '3003333333',
  });
  clientId = client._id;

  const moto = await Motorcycle.create({
    plate: 'SCH001',
    brand: 'Honda',
    model: 'CB190',
    year: 2024,
    mileage: 2000,
    client: clientId,
  });
  motorcycleId = moto._id;

  const mechanic = await User.create({
    name: 'Sched Mech',
    email: 'schedmech@test.dev',
    cedula: '3434343434',
    password: 'mec123456',
    rol: 'mecanico',
  });

  const today = new Date().toISOString().split('T')[0];

  await Order.create({
    motorcycle: motorcycleId,
    client: clientId,
    mechanic: mechanic._id,
    entryReason: 'Test schedule',
    status: 'ingresada',
    serviceType: 'complejo',
    scheduledDate: today,
    estimatedDays: 2,
    priority: 'alta',
  });

  await Order.create({
    motorcycle: motorcycleId,
    client: clientId,
    mechanic: mechanic._id,
    entryReason: 'Test schedule 2',
    status: 'ingresada',
    serviceType: 'medio',
    scheduledDate: today,
    estimatedDays: 1,
    priority: 'normal',
  });
}, 30000);

afterAll(async () => {
  await teardownTestDB();
}, 15000);

describe('Schedule API', () => {
  describe('GET /api/schedule', () => {
    it('requiere from y to', async () => {
      const res = await request(app)
        .get('/api/schedule')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('from');
    });

    it('retorna capacidad por rango de fechas', async () => {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000)
        .toISOString()
        .split('T')[0];

      const res = await request(app)
        .get(`/api/schedule?from=${today}&to=${nextWeek}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.config).toBeDefined();
      expect(res.body.config.dailyCapacityUnits).toBe(6);
      expect(res.body.config.serviceTypes).toBeDefined();
      expect(res.body.days).toBeDefined();
      expect(res.body.nextAvailableDate).toBeDefined();
    });

    it('muestra unidades usadas correctamente', async () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000)
        .toISOString()
        .split('T')[0];

      const res = await request(app)
        .get(`/api/schedule?from=${today}&to=${tomorrow}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const todayData = res.body.days[today];
      expect(todayData).toBeDefined();
      expect(todayData.usedUnits).toBeGreaterThanOrEqual(3);
      expect(todayData.maxUnits).toBe(6);
    });
  });

  describe('GET /api/schedule/check', () => {
    it('retorna capacidad para un día específico', async () => {
      const today = new Date().toISOString().split('T')[0];

      const res = await request(app)
        .get(`/api/schedule/check?date=${today}&serviceType=rapido`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.date).toBe(today);
      expect(res.body.serviceType).toBe('rapido');
      expect(typeof res.body.canFit).toBe('boolean');
      expect(typeof res.body.availableUnits).toBe('number');
      expect(res.body.message).toBeDefined();
    });

    it('sugiere fecha cuando el día está lleno', async () => {
      const settings = await Settings.getSettings();
      settings.dailyCapacityUnits = 3;
      await settings.save();

      const today = new Date().toISOString().split('T')[0];

      const res = await request(app)
        .get(`/api/schedule/check?date=${today}&serviceType=complejo`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.canFit).toBe(false);
      expect(res.body.wouldExceed).toBe(true);
    });

    it('rechaza sin fecha ni tipo', async () => {
      const res = await request(app)
        .get('/api/schedule/check')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
    });
  });
});
