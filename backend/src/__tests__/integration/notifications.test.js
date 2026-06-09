import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import User from '../../models/user.model.js';
import Notification from '../../models/notification.model.js';
import { setupTestDB, teardownTestDB } from '../test-helper.js';

let app;
let adminToken;
let mechanicToken;
let mechanicId;
let adminId;

beforeAll(async () => {
  await setupTestDB();
  app = (await import('../../../app.js')).default;

  const admin = await User.create({
    name: 'Admin Notif',
    email: 'adminotif@test.com',
    cedula: '8800000001',
    password: 'admin123',
    rol: 'admin',
  });
  adminId = admin._id;

  const loginAdmin = await request(app)
    .post('/api/users/login')
    .send({ email: 'adminotif@test.com', password: 'admin123' });
  adminToken = loginAdmin.body.accessToken;

  const mech = await User.create({
    name: 'Mec Notif',
    email: 'mecnotif@test.com',
    cedula: '8800000002',
    password: 'mecanico123',
    rol: 'mecanico',
  });
  mechanicId = mech._id;

  const loginMech = await request(app)
    .post('/api/users/login')
    .send({ email: 'mecnotif@test.com', password: 'mecanico123' });
  mechanicToken = loginMech.body.accessToken;
}, 30000);

afterAll(async () => {
  await teardownTestDB();
}, 15000);

describe('Notifications API', () => {
  describe('GET /api/notifications', () => {
    beforeEach(async () => {
      await Notification.deleteMany({});
    });

    it('retorna lista vacía cuando no hay notificaciones', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.notifications).toEqual([]);
    });

    it('retorna solo las notificaciones del usuario autenticado', async () => {
      await Notification.create({ userId: adminId, type: 'order_status', title: 'Admin', message: 'msg' });
      await Notification.create({ userId: mechanicId, type: 'order_status', title: 'Mec', message: 'msg' });

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.notifications).toHaveLength(1);
      expect(res.body.notifications[0].title).toBe('Admin');
    });

    it('retorna 401 sin token', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    beforeEach(async () => {
      await Notification.deleteMany({});
    });

    it('retorna 0 cuando no hay notificaciones', async () => {
      const res = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
    });

    it('retorna conteo de no leídas del usuario', async () => {
      await Notification.create({ userId: adminId, type: 'order_status', title: 'A', message: 'a', read: false });
      await Notification.create({ userId: adminId, type: 'order_status', title: 'B', message: 'b', read: true });
      await Notification.create({ userId: mechanicId, type: 'order_status', title: 'C', message: 'c', read: false });

      const res = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
    });

    it('retorna 401 sin token', async () => {
      const res = await request(app).get('/api/notifications/unread-count');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    beforeEach(async () => {
      await Notification.deleteMany({});
    });

    it('marca todas las notificaciones como leídas', async () => {
      await Notification.create({ userId: adminId, type: 'order_status', title: 'A', message: 'a', read: false });
      await Notification.create({ userId: adminId, type: 'order_status', title: 'B', message: 'b', read: false });

      const res = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);

      const unread = await Notification.countDocuments({ userId: adminId, read: false });
      expect(unread).toBe(0);
    });

    it('no afecta notificaciones de otros usuarios', async () => {
      await Notification.create({ userId: mechanicId, type: 'order_status', title: 'M', message: 'm', read: false });

      await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${adminToken}`);

      const unread = await Notification.countDocuments({ userId: mechanicId, read: false });
      expect(unread).toBe(1);
    });

    it('retorna 401 sin token', async () => {
      const res = await request(app).put('/api/notifications/read-all');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    let notifId;

    beforeEach(async () => {
      await Notification.deleteMany({});
      const n = await Notification.create({ userId: adminId, type: 'order_status', title: 'T', message: 'msg', read: false });
      notifId = n._id;
    });

    it('marca una notificación como leída', async () => {
      const res = await request(app)
        .put(`/api/notifications/${notifId}/read`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);

      const n = await Notification.findById(notifId);
      expect(n.read).toBe(true);
    });

    it('rechaza marcar notificación de otro usuario (no la encuentra)', async () => {
      const res = await request(app)
        .put(`/api/notifications/${notifId}/read`)
        .set('Authorization', `Bearer ${mechanicToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Marked as read');

      const n = await Notification.findById(notifId);
      expect(n.read).toBe(false);
    });

    it('retorna 200 para ID inexistente (no modifica nada)', async () => {
      const fakeId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
      const res = await request(app)
        .put(`/api/notifications/${fakeId}/read`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('retorna 401 sin token', async () => {
      const res = await request(app).put(`/api/notifications/${notifId}/read`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/notifications/request-assistance', () => {
    beforeEach(async () => {
      await Notification.deleteMany({});
    });

    it('crea notificación para el admin', async () => {
      const res = await request(app)
        .post('/api/notifications/request-assistance')
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ description: 'No puedo ver las órdenes asignadas' });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Solicitud enviada al administrador');

      const notifs = await Notification.find({ userId: adminId, type: 'assistance_request' });
      expect(notifs).toHaveLength(1);
      expect(notifs[0].message).toContain('Mec Notif');
      expect(notifs[0].message).toContain('No puedo ver las órdenes asignadas');
    });

    it('rechaza descripción vacía', async () => {
      const res = await request(app)
        .post('/api/notifications/request-assistance')
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ description: '' });
      expect(res.status).toBe(400);
    });

    it('rechaza sin description en el body', async () => {
      const res = await request(app)
        .post('/api/notifications/request-assistance')
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('rechaza más de 50 palabras', async () => {
      const longDesc = Array(51).fill('palabra').join(' ');
      const res = await request(app)
        .post('/api/notifications/request-assistance')
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ description: longDesc });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('50 palabras');
    });

    it('retorna 401 sin token', async () => {
      const res = await request(app)
        .post('/api/notifications/request-assistance')
        .send({ description: 'ayuda' });
      expect(res.status).toBe(401);
    });
  });
});
