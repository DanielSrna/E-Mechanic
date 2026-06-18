import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { SettingsProvider, useSettings } from '../../context/SettingsContext';
import React from 'react';

const mockApi = {
  get: vi.fn(),
};
const mockUseAuth = { user: null };

vi.mock('../../api/axios', () => ({
  default: {
    get: (...args) => mockApi.get(...args),
  },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth,
}));

function wrapper({ children }) {
  return React.createElement(SettingsProvider, null, children);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.user = null;
  mockApi.get.mockReset();
});

describe('SettingsContext', () => {
  it('no fetchea si no hay user', async () => {
    mockUseAuth.user = null;
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings).toBeNull();
    expect(mockApi.get).not.toHaveBeenCalled();
  });

  it('fetchea settings cuando user existe', async () => {
    mockUseAuth.user = { _id: '1', rol: 'admin' };
    mockApi.get.mockResolvedValueOnce({
      data: { settings: { appName: 'Mi Taller', primaryColor: '#ff0000' } },
    });

    const { result } = renderHook(() => useSettings(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    expect(result.current.settings.appName).toBe('Mi Taller');
    expect(mockApi.get).toHaveBeenCalledWith('/settings');
  });

  it('updateSettings actualiza el estado local', async () => {
    mockUseAuth.user = { _id: '1', rol: 'admin' };
    mockApi.get.mockResolvedValueOnce({ data: { settings: { appName: 'Old' } } });

    const { result } = renderHook(() => useSettings(), { wrapper });
    await waitFor(() => result.current.settings !== null);

    act(() => {
      result.current.updateSettings({ appName: 'New', primaryColor: '#000' });
    });

    expect(result.current.settings.appName).toBe('New');
    expect(result.current.settings.primaryColor).toBe('#000');
  });
});
