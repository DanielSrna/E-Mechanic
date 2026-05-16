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
    email: 'testadmin@test.com',
    cedula: '0000000000',
    password: 'admin123',
    rol: 'admin',
  });
  const login = await request(app)
    .post('/api/users/login')
    .send({ email: 'testadmin@test.com', password: 'admin123' });
  adminToken = login.body.accessToken;
}, 30000);

afterAll(async () => {
  await teardownTestDB();
}, 15000);

describe('Auth API', () => {
  describe('POST /api/users (admin crea usuarios)', () => {
    it('admin crea un usuario y retorna 201', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test User',
          email: 'test@test.com',
          cedula: '1234567890',
          password: 'test123',
          passwordConfirmation: 'test123',
        });
      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('test@test.com');
      expect(res.body.user.name).toBe('Test User');
    });

    it('capitaliza el nombre automáticamente', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'juan perez',
          email: 'juan@test.com',
          cedula: '1234567891',
          password: 'test123',
          passwordConfirmation: 'test123',
        });
      expect(res.body.user.name).toBe('Juan Perez');
    });

    it('rechaza email duplicado con 400', async () => {
      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'First',
          email: 'dup@test.com',
          cedula: '1111111111',
          password: 'test123',
          passwordConfirmation: 'test123',
        });
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Second',
          email: 'dup@test.com',
          cedula: '2222222222',
          password: 'test123',
          passwordConfirmation: 'test123',
        });
      expect(res.status).toBe(400);
    });

    it('rechaza cédula duplicada con 400', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Third',
          email: 'third@test.com',
          cedula: '1111111111',
          password: 'test123',
          passwordConfirmation: 'test123',
        });
      expect(res.status).toBe(400);
    });

    it('rechaza contraseñas que no coinciden', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test',
          email: 'pwd@test.com',
          cedula: '3333333333',
          password: 'test123',
          passwordConfirmation: 'different',
        });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/users/login', () => {
    beforeAll(async () => {
      await User.create({
        name: 'Login Test',
        email: 'login@test.com',
        cedula: '4444444444',
        password: 'test123',
        rol: 'mecanico',
      });
    });

    it('login exitoso retorna accessToken', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'login@test.com', password: 'test123' });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });

    it('login falla con credenciales incorrectas', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'login@test.com', password: 'wrong' });
      expect(res.status).toBe(401);
    });

    it('login falla con usuario inexistente', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'noexiste@test.com', password: 'test123' });
      expect(res.status).toBe(401);
    });

    it('setea cookie httpOnly con refreshToken', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'login@test.com', password: 'test123' });
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('HttpOnly');
    });
  });

  describe('GET /api/users/me', () => {
    let token;

    beforeAll(async () => {
      await User.create({
        name: 'Me Test',
        email: 'me@test.com',
        cedula: '5555555555',
        password: 'test123',
        rol: 'mecanico',
      });
      const login = await request(app)
        .post('/api/users/login')
        .send({ email: 'me@test.com', password: 'test123' });
      token = login.body.accessToken;
    });

    it('retorna perfil del usuario autenticado', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('me@test.com');
      expect(res.body.user.password).toBeUndefined();
    });

    it('retorna 401 sin token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });
  });

  describe('Auth flow completo (admin create → user login)', () => {
    it('admin crea user → login → me → refresh → logout', async () => {
      // Admin creates user
      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Flow Test',
          email: 'flow@test.com',
          cedula: '6666666666',
          password: 'test123',
          passwordConfirmation: 'test123',
        });

      // Login as the new user
      const login = await request(app)
        .post('/api/users/login')
        .send({ email: 'flow@test.com', password: 'test123' });
      expect(login.status).toBe(200);
      const token = login.body.accessToken;
      const cookie = login.headers['set-cookie'];

      // Me
      const me = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);
      expect(me.status).toBe(200);

      // Refresh
      const refresh = await request(app)
        .post('/api/users/refresh-token')
        .set('Cookie', cookie);
      expect(refresh.status).toBe(200);
      expect(refresh.body.accessToken).toBeDefined();

      // Logout
      const logout = await request(app)
        .post('/api/users/logout')
        .set('Cookie', cookie);
      expect(logout.status).toBe(200);

      // Refresh after logout fails
      const refresh2 = await request(app)
        .post('/api/users/refresh-token')
        .set('Cookie', cookie);
      expect(refresh2.status).toBe(401);
    });
  });

  describe('Fire mechanic and reassign', () => {
    it('admin despide mecánico y reasigna órdenes', async () => {
      const { body } = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Fire Me',
          email: 'fire@test.com',
          cedula: '7777777777',
          password: 'test123',
          passwordConfirmation: 'test123',
        });
      const userId = body.user._id;

      const res = await request(app)
        .put(`/api/users/${userId}/fire`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deactivated');
    });
  });
});
