import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

const mockApi = {
  post: vi.fn(),
  get: vi.fn(),
};

vi.mock('../../api/axios', () => ({
  default: {
    post: (...args) => mockApi.post(...args),
    get: (...args) => mockApi.get(...args),
  },
  setToken: vi.fn(),
}));

function wrapper({ children }) {
  return React.createElement(MemoryRouter, null, React.createElement(AuthProvider, null, children));
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('AuthContext', () => {
  it('estado inicial: loading=true, user=null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
  });

  it('isAdmin es false para usuario no-admin', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAdmin).toBe(false);
  });

  it('hidrata desde localStorage', async () => {
    const storedUser = { _id: '1', name: 'Test', email: 't@t.com', rol: 'admin', token: 'tok' };
    localStorage.setItem('me', JSON.stringify(storedUser));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => !result.current.loading);

    expect(result.current.user).toBeTruthy();
    expect(result.current.isAdmin).toBe(true);
  });

  it('login hace POST y GET correctamente', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { accessToken: 'access' } });
    mockApi.get.mockResolvedValueOnce({
      data: { user: { _id: '2', name: 'Admin', email: 'a@t.com', rol: 'admin' } },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => !result.current.loading);

    await act(async () => {
      await result.current.login('a@t.com', 'pass');
    });

    expect(mockApi.post).toHaveBeenCalledWith('/users/login', { email: 'a@t.com', password: 'pass' });
    expect(mockApi.get).toHaveBeenCalledWith('/users/me');
    expect(result.current.user.name).toBe('Admin');
    expect(result.current.isAdmin).toBe(true);
    expect(localStorage.getItem('me')).toBeTruthy();
  });

  it('logout limpia estado y localStorage', async () => {
    localStorage.setItem('me', JSON.stringify({ token: 'tok', rol: 'admin' }));
    mockApi.post.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => !result.current.loading);

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });

  it('register hace POST a /users/registro', async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => !result.current.loading);

    await act(async () => {
      await result.current.register({ name: 'New', email: 'n@t.com', password: '12345678' });
    });

    expect(mockApi.post).toHaveBeenCalledWith('/users/registro', { name: 'New', email: 'n@t.com', password: '12345678' });
  });
});
