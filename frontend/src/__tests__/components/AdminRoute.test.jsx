import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminRoute from '../../components/Layout/AdminRoute';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

let mockAuth;

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

function renderWithRouter(children) {
  return render(React.createElement(MemoryRouter, null, children));
}

beforeEach(() => {
  mockAuth = { user: null, loading: false, isAdmin: false };
});

describe('AdminRoute', () => {
  it('muestra children para admin', () => {
    mockAuth = { user: { rol: 'admin' }, loading: false, isAdmin: true };
    renderWithRouter(
      React.createElement(AdminRoute, null, React.createElement('div', { 'data-testid': 'admin-content' }, 'Panel Admin'))
    );
    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
  });

  it('redirige a /orders para mecánico', () => {
    mockAuth = { user: { rol: 'mecanico' }, loading: false, isAdmin: false };
    renderWithRouter(
      React.createElement(AdminRoute, null, React.createElement('div', null, 'No debería verse'))
    );
    expect(screen.queryByText('No debería verse')).not.toBeInTheDocument();
  });

  it('redirige a /login si no hay user', () => {
    mockAuth = { user: null, loading: false, isAdmin: false };
    renderWithRouter(
      React.createElement(AdminRoute, null, React.createElement('div', null, 'No debería verse'))
    );
    expect(screen.queryByText('No debería verse')).not.toBeInTheDocument();
  });

  it('no renderiza nada mientras carga', () => {
    mockAuth = { user: null, loading: true, isAdmin: false };
    const { container } = renderWithRouter(
      React.createElement(AdminRoute, null, React.createElement('div', null, 'Cargando...'))
    );
    expect(container.innerHTML).toBe('');
  });
});
