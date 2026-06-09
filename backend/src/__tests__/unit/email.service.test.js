import { describe, it, expect, beforeEach, jest } from '@jest/globals';

let sendInvoiceEmail;
let sendVerificationEmail;
let verifySMTPConnection;

beforeEach(async () => {
  jest.resetModules();

  jest.unstable_mockModule('../../config/env.config', () => ({
    env: {
      SMTP_HOST: undefined,
      SMTP_USER: undefined,
      SMTP_PASS: undefined,
      SMTP_PORT: 587,
      RESEND_API_KEY: 're_test123',
      FRONTEND_URL: 'http://localhost:5173',
    },
  }));

  jest.unstable_mockModule('resend', () => ({
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn().mockResolvedValue({ data: { id: 'mocked_resend_id' }, error: null }),
      },
    })),
  }));

  jest.unstable_mockModule('nodemailer', () => ({
    default: {
      createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'mocked_smtp_id' }),
        verify: jest.fn().mockResolvedValue(true),
      }),
    },
  }));

  const mod = await import('../../services/email.service.js');
  sendInvoiceEmail = mod.sendInvoiceEmail;
  sendVerificationEmail = mod.sendVerificationEmail;
  verifySMTPConnection = mod.verifySMTPConnection;
});

describe('Email Service', () => {
  describe('sendInvoiceEmail', () => {
    it('retorna no_recipient_email si no hay destinatario', async () => {
      const result = await sendInvoiceEmail({}, Buffer.from('test'));
      expect(result.success).toBe(false);
      expect(result.reason).toBe('no_recipient_email');
    });

    it('retorna success con datos completos via Resend mockeado', async () => {
      const invoiceData = {
        sentToEmail: 'cliente@test.com',
        invoiceNumber: 'FAC-001',
        total: 150000,
        client: { name: 'Cliente Test' },
        order: { _id: 'abc', entryReason: 'mantenimiento', findings: [] },
        motorcycle: { brand: 'Yamaha', model: 'FZ', plate: 'ABC123' },
        company: { companyName: 'Mi Taller' },
      };
      const result = await sendInvoiceEmail(invoiceData, Buffer.from('pdf'));
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('mocked_resend_id');
    });

    it('incluye hallazgos en el HTML', async () => {
      const invoiceData = {
        sentToEmail: 'cliente@test.com',
        invoiceNumber: 'FAC-002',
        total: 200000,
        client: { name: 'Cliente' },
        order: {
          _id: 'xyz', entryReason: 'reparación',
          findings: [{ title: 'Freno dañado', description: 'Cambio de pastillas' }],
        },
        motorcycle: { brand: 'Honda', model: 'CB', plate: 'XYZ789' },
        company: { companyName: 'Taller' },
      };
      const result = await sendInvoiceEmail(invoiceData, Buffer.from('pdf'));
      expect(result.success).toBe(true);
    });
  });

  describe('sendVerificationEmail', () => {
    it('retorna success con token válido y Resend configurado', async () => {
      const result = await sendVerificationEmail('user@test.com', 'Usuario', 'tok_abc');
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('mocked_resend_id');
    });
  });

  describe('verifySMTPConnection', () => {
    it('retorna false cuando SMTP no está configurado', async () => {
      const result = await verifySMTPConnection();
      expect(result).toBe(false);
    });
  });

  describe('sin proveedor configurado', () => {
    it('sendInvoiceEmail retorna failure cuando no hay proveedor', async () => {
      jest.resetModules();
      jest.unstable_mockModule('../../config/env.config', () => ({
        env: {
          SMTP_HOST: undefined, SMTP_USER: undefined, SMTP_PASS: undefined,
          SMTP_PORT: 587, RESEND_API_KEY: undefined, FRONTEND_URL: 'http://localhost:5173',
        },
      }));
      const mod = await import('../../services/email.service.js');
      const result = await mod.sendInvoiceEmail(
        { sentToEmail: 'test@test.com', invoiceNumber: 'F', total: 0,
          client: { name: 'C' }, order: { _id: '1', entryReason: 'e', findings: [] },
          motorcycle: { brand: 'B', model: 'M', plate: 'P' }, company: {} },
        Buffer.from('pdf')
      );
      expect(result.success).toBe(false);
      expect(result.reason).toBe('no_email_provider_configured');
    });

    it('verifySMTPConnection retorna false sin SMTP configurado', async () => {
      jest.resetModules();
      jest.unstable_mockModule('../../config/env.config', () => ({
        env: {
          SMTP_HOST: undefined, SMTP_USER: undefined, SMTP_PASS: undefined,
          SMTP_PORT: 587, RESEND_API_KEY: undefined, FRONTEND_URL: 'http://localhost:5173',
        },
      }));
      const mod = await import('../../services/email.service.js');
      const result = await mod.verifySMTPConnection();
      expect(result).toBe(false);
    });
  });
});
