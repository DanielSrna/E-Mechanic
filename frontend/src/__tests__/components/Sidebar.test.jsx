import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Sidebar from '../../components/Layout/Sidebar';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

let mockAuth;
let mockSettings;

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => mockSettings,
}));

vi.mock('../../components/HelpButton', () => ({
  default: () => React.createElement('div', { 'data-testid': 'help-btn' }),
}));
vi.mock('../../components/AssistButton', () => ({
  default: () => React.createElement('div', { 'data-testid': 'assist-btn' }),
}));

beforeEach(() => {
  mockAuth = {
    user: { name: 'Admin', rol: 'admin' },
    logout: vi.fn(),
    isAdmin: true,
  };
  mockSettings = { settings: {} };
});

describe('Sidebar', () => {
  it('renderiza el nombre de la app', () => {
    mockSettings.settings = { appName: 'Mi Taller' };
    render(
      React.createElement(MemoryRouter, null,
        React.createElement(Sidebar, { open: false, onClose: vi.fn(), onRepeatTour: vi.fn() })
      )
    );
    expect(screen.getByText('Mi Taller')).toBeInTheDocument();
  });

  it('muestra HelpButton para admin', () => {
    render(
      React.createElement(MemoryRouter, null,
        React.createElement(Sidebar, { open: false, onClose: vi.fn(), onRepeatTour: vi.fn() })
      )
    );
    expect(screen.getByTestId('help-btn')).toBeInTheDocument();
  });

  it('muestra AssistButton para mecánico', () => {
    mockAuth.isAdmin = false;
    mockAuth.user.rol = 'mecanico';
    render(
      React.createElement(MemoryRouter, null,
        React.createElement(Sidebar, { open: false, onClose: vi.fn(), onRepeatTour: vi.fn() })
      )
    );
    expect(screen.getByTestId('assist-btn')).toBeInTheDocument();
  });

  it('filtra items admin-only para mecánico', () => {
    mockAuth.isAdmin = false;
    mockAuth.user.rol = 'mecanico';
    render(
      React.createElement(MemoryRouter, null,
        React.createElement(Sidebar, { open: false, onClose: vi.fn(), onRepeatTour: vi.fn() })
      )
    );
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Mecánicos')).not.toBeInTheDocument();
    expect(screen.getByText('Órdenes')).toBeInTheDocument();
  });
});
