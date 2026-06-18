import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Login from '../../pages/Login';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

let mockAuth;

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

beforeEach(() => {
  mockAuth = { login: vi.fn() };
});

describe('Login', () => {
  it('renderiza el formulario de login', () => {
    render(
      React.createElement(MemoryRouter, null, React.createElement(Login))
    );
    expect(screen.getByText('E-Mechanic')).toBeInTheDocument();
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
  });
});
