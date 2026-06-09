import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import User from '../../models/user.model.js';
import JWT from '../../models/jwt.model.js';
import { setupTestDB, teardownTestDB } from '../test-helper.js';

let app;
let adminToken;

beforeAll(async () => {
  await setupTestDB();
  app = (await import('../../../app.js')).default;

  await User.create({
    name: 'Email Admin',
    email: 'emailadmin@test.com',
    cedula: '9900000001',
    password: 'admin123',
    rol: 'admin',
  });

  const login = await request(app)
    .post('/api/users/login')
    .send({ email: 'emailadmin@test.com', password: 'admin123' });
  adminToken = login.body.accessToken;
}, 30000);

afterAll(async () => {
  await teardownTestDB();
}, 15000);

describe('Change Email API', () => {
  describe('PUT /api/users/change-email', () => {
    it('actualiza pendingEmail y retorna 200', async () => {
      const res = await request(app)
        .put('/api/users/change-email')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ currentPassword: 'admin123', newEmail: 'nuevo@test.com' });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Verification');

      const user = await User.findOne({ email: 'emailadmin@test.com' });
      expect(user.pendingEmail).toBe('nuevo@test.com');
    });

    it('rechaza sin currentPassword', async () => {
      const res = await request(app)
        .put('/api/users/change-email')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newEmail: 'x@test.com' });
      expect(res.status).toBe(400);
    });

    it('rechaza contraseña incorrecta', async () => {
      const res = await request(app)
        .put('/api/users/change-email')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ currentPassword: 'wrongpass', newEmail: 'x@test.com' });
      expect(res.status).toBe(400);
    });

    it('rechaza email duplicado', async () => {
      await User.create({
        name: 'Existing', email: 'exists@test.com', cedula: '9900000002',
        password: 'test123', rol: 'mecanico',
      });
      const res = await request(app)
        .put('/api/users/change-email')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ currentPassword: 'admin123', newEmail: 'exists@test.com' });
      expect(res.status).toBe(409);
    });

    it('rechaza formato de email inválido', async () => {
      const res = await request(app)
        .put('/api/users/change-email')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ currentPassword: 'admin123', newEmail: 'notanemail' });
      expect(res.status).toBe(400);
    });

    it('retorna 401 sin token', async () => {
      const res = await request(app)
        .put('/api/users/change-email')
        .send({ currentPassword: 'admin123', newEmail: 'x@test.com' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/verify-email', () => {
    let verifyToken;

    beforeAll(async () => {
      const user = await User.findOne({ email: 'emailadmin@test.com' });
      user.pendingEmail = 'verified@test.com';
      await user.save();

      verifyToken = 'verify-token-1234567890abcdef';
      await JWT.saveToken(user._id, verifyToken, 'verifyEmail', 'email-change', 24 * 60 * 60 * 1000);
    });

    it('verifica email con token válido', async () => {
      const res = await request(app)
        .get(`/api/users/verify-email?token=${verifyToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('verified');

      const user = await User.findById(
        (await User.findOne({ email: 'verified@test.com' }))._id
      );
      expect(user.email).toBe('verified@test.com');
      expect(user.pendingEmail).toBeFalsy();
    });

    it('rechaza token inválido', async () => {
      const res = await request(app)
        .get('/api/users/verify-email?token=fake-token-12345');
      expect(res.status).toBe(400);
    });

    it('rechaza sin token', async () => {
      const res = await request(app).get('/api/users/verify-email');
      expect(res.status).toBe(400);
    });
  });
});
