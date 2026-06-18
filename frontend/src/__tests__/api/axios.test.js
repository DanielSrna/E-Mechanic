import { describe, it, expect, beforeEach, vi } from 'vitest';

let setToken, getToken;

beforeEach(async () => {
  vi.resetModules();
  vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() });

  vi.stubGlobal('window', { location: { pathname: '/', href: '' } });

  vi.doMock('axios', () => {
    const mockInstance = {
      post: vi.fn(),
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn((fn) => mockInstance.interceptors.request.handlers.push(fn)), handlers: [] },
        response: { use: vi.fn((fn, errFn) => mockInstance.interceptors.response.handlers.push(errFn)), handlers: [] },
      },
    };
    return {
      default: {
        create: vi.fn(() => mockInstance),
        post: vi.fn(),
      },
    };
  });

  const mod = await import('../../api/axios');
  setToken = mod.setToken;
  getToken = mod.getToken;
});

describe('setToken / getToken', () => {
  it('inicia null', () => {
    expect(getToken()).toBeNull();
  });

  it('setToken guarda y recupera', () => {
    setToken('abc');
    expect(getToken()).toBe('abc');
  });

  it('setToken(null) limpia', () => {
    setToken('x');
    setToken(null);
    expect(getToken()).toBeNull();
  });
});
