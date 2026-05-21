import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import User from '../../models/user.model.js';
import { setupTestDB, teardownTestDB } from '../test-helper.js';

let app;
let adminToken;

beforeAll(async () => {
  await setupTestDB();
  app = (await import('../../../app.js')).default;

  await User.create({
    name: 'Admin',
    email: 'admin.exp@test.dev',
    cedula: '4444444444',
    password: 'admin123',
    rol: 'admin',
  });
  const login = await request(app)
    .post('/api/users/login')
    .send({ email: 'admin.exp@test.dev', password: 'admin123' });
  adminToken = login.body.accessToken;
}, 30000);

afterAll(async () => {
  await teardownTestDB();
}, 15000);

describe('Export API', () => {
  describe('GET /api/export/orders', () => {
    it('retorna CSV de órdenes con headers correctos', async () => {
      const res = await request(app)
        .get('/api/export/orders')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('ordenes.csv');
    });
  });

  describe('GET /api/export/inventory', () => {
    it('retorna CSV de inventario con headers correctos', async () => {
      const res = await request(app)
        .get('/api/export/inventory')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('inventario.csv');
    });
  });

  it('rechaza sin auth con 401', async () => {
    const res = await request(app).get('/api/export/orders');
    expect(res.status).toBe(401);
  });
});
