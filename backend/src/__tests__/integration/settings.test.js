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
    email: 'admin.set@test.dev',
    cedula: '9999999999',
    password: 'admin123',
    rol: 'admin',
  });
  const login = await request(app)
    .post('/api/users/login')
    .send({ email: 'admin.set@test.dev', password: 'admin123' });
  adminToken = login.body.accessToken;
}, 30000);

afterAll(async () => {
  await teardownTestDB();
}, 15000);

describe('Settings API', () => {
  describe('GET /api/settings', () => {
    it('retorna configuración con campos requeridos', async () => {
      const res = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.settings).toBeDefined();
      expect(res.body.settings.appName).toBeDefined();
    });
  });

  describe('PUT /api/settings', () => {
    it('actualiza appName y colores', async () => {
      const res = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          appName: 'Mi Taller',
          primaryColor: '#ff0000',
          secondaryColor: '#00ff00',
          accentColor: '#0000ff',
        });
      expect(res.status).toBe(200);
      expect(res.body.settings.appName).toBe('Mi Taller');
      expect(res.body.settings.primaryColor).toBe('#ff0000');
    });

    it('actualiza datos de empresa', async () => {
      const res = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          companyName: 'Taller Ejemplo SAS',
          companyNit: '901234567-1',
          companyAddress: 'Calle 123 #45-67',
          companyPhone: '+573001234567',
          companyEmail: 'contacto@taller.com',
        });
      expect(res.status).toBe(200);
      expect(res.body.settings.companyName).toBe('Taller Ejemplo SAS');
      expect(res.body.settings.companyNit).toBe('901234567-1');
    });

    it('ignora campos undefined (no sobrescribe)', async () => {
      await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ companyName: 'Nombre Nuevo' });

      const res = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ companyAddress: 'Nueva Direccion' });

      expect(res.body.settings.companyName).toBe('Nombre Nuevo');
      expect(res.body.settings.companyAddress).toBe('Nueva Direccion');
    });
  });

  describe('POST /api/settings/logo (subir logo)', () => {
    it('rechaza sin archivo con 400', async () => {
      const res = await request(app)
        .post('/api/settings/logo')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
    });
  });
});
