import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from '@jest/globals';
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
    email: 'admin.part@test.dev',
    cedula: '7777777777',
    password: 'admin123',
    rol: 'admin',
  });
  const login = await request(app)
    .post('/api/users/login')
    .send({ email: 'admin.part@test.dev', password: 'admin123' });
  adminToken = login.body.accessToken;
}, 30000);

afterAll(async () => {
  await teardownTestDB();
}, 15000);

describe('Parts API', () => {
  describe('POST /api/parts', () => {
    it('crea repuesto con SKU en mayúsculas', async () => {
      const res = await request(app)
        .post('/api/parts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sku: 'OIL-10W40',
          name: 'aceite sintetico',
          purchasePrice: 25000,
          salePrice: 45000,
          stock: 15,
        });
      expect(res.status).toBe(201);
      expect(res.body.part.sku).toBe('OIL-10W40');
      expect(res.body.part.name).toBe('Aceite Sintetico');
    });

    it('rechaza SKU duplicado con 409', async () => {
      await request(app)
        .post('/api/parts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sku: 'DUP-001',
          name: 'Uno',
          purchasePrice: 1000,
          salePrice: 2000,
        });

      const res = await request(app)
        .post('/api/parts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sku: 'DUP-001',
          name: 'Dos',
          purchasePrice: 1000,
          salePrice: 2000,
        });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/parts', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/parts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sku: 'SKU-A',
          name: 'Repuesto A',
          purchasePrice: 1000,
          salePrice: 2000,
          stock: 10,
          minStock: 5,
        });
      await request(app)
        .post('/api/parts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sku: 'SKU-B',
          name: 'Repuesto B',
          purchasePrice: 1000,
          salePrice: 2000,
          stock: 2,
          minStock: 5,
        });
    });

    it('lista todos', async () => {
      const res = await request(app)
        .get('/api/parts')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(2);
    });

    it('filtra por lowStock=true', async () => {
      const res = await request(app)
        .get('/api/parts?lowStock=true')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      const found = res.body.parts.filter((p) => p.stock <= p.minStock);
      expect(found.length).toBeGreaterThanOrEqual(1);
    });

    it('busca por texto', async () => {
      const res = await request(app)
        .get('/api/parts?search=SKU-A')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('PUT /api/parts/:id', () => {
    it('actualiza stock y precio', async () => {
      const created = await request(app)
        .post('/api/parts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sku: 'UPD-001',
          name: 'Update Me',
          purchasePrice: 1000,
          salePrice: 2000,
          stock: 5,
        });

      const res = await request(app)
        .put(`/api/parts/${created.body.part._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stock: 20, salePrice: 2500 });

      expect(res.status).toBe(200);
      expect(res.body.part.stock).toBe(20);
      expect(res.body.part.salePrice).toBe(2500);
    });
  });

  describe('DELETE /api/parts/:id', () => {
    it('elimina repuesto', async () => {
      const created = await request(app)
        .post('/api/parts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sku: 'DEL-001',
          name: 'Delete Me',
          purchasePrice: 1000,
          salePrice: 2000,
        });

      const res = await request(app)
        .delete(`/api/parts/${created.body.part._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });
});
