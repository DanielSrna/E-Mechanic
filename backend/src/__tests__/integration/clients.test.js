import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import User from '../../models/user.model.js';
import Client from '../../models/client.model.js';
import { setupTestDB, teardownTestDB } from '../test-helper.js';

let app;
let adminToken;

beforeAll(async () => {
  await setupTestDB();
  app = (await import('../../../app.js')).default;
  const admin = await User.create({
    name: 'Admin', email: 'admin.clients@test.dev', cedula: '8888999900',
    password: 'admin123', rol: 'admin',
  });
  const login = await request(app)
    .post('/api/users/login')
    .send({ email: 'admin.clients@test.dev', password: 'admin123' });
  adminToken = login.body.accessToken;
  if (!adminToken) throw new Error('Admin login failed in client tests');
}, 30000);

afterAll(async () => {
  await teardownTestDB();
}, 15000);

describe('Clients API', () => {
  describe('POST /api/clients', () => {
    it('crea cliente con nombre capitalizado', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'carlos mendoza', phone: '3001234567' });
      expect(res.status).toBe(201);
      expect(res.body.client.name).toBe('Carlos Mendoza');
    });

    it('crea cliente con email y dirección opcionales', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'ana garcia', phone: '3102223344',
          email: 'ana@test.com', address: 'Calle 123',
        });
      expect(res.status).toBe(201);
      expect(res.body.client.email).toBe('ana@test.com');
      expect(res.body.client.address).toBe('Calle 123');
    });

    it('rechaza teléfono inválido', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test', phone: 'abc' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/clients', () => {
    beforeEach(async () => {
      await Client.create({ name: 'Pedro', phone: '3001111111', email: 'pedro@test.com' });
      await Client.create({ name: 'Maria', phone: '3002222222' });
    });

    it('lista todos los clientes', async () => {
      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(2);
    });

    it('busca por nombre con search', async () => {
      const res = await request(app)
        .get('/api/clients?search=pedro')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
      expect(res.body.clients[0].name).toContain('Pedro');
    });
  });

  describe('PUT /api/clients/:id', () => {
    it('actualiza datos del cliente', async () => {
      const created = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Update Me', phone: '3003333333' });

      const res = await request(app)
        .put(`/api/clients/${created.body.client._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ address: 'Nueva dirección' });

      expect(res.status).toBe(200);
      expect(res.body.client.address).toBe('Nueva dirección');
    });

    it('retorna 404 para ID inexistente', async () => {
      const res = await request(app)
        .put('/api/clients/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ address: 'Test' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/clients/:id', () => {
    it('elimina un cliente', async () => {
      const created = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Delete Me', phone: '3004444444' });

      const res = await request(app)
        .delete(`/api/clients/${created.body.client._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });
});
