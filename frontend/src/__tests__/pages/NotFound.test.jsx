import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '../../pages/NotFound';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

describe('NotFound', () => {
  it('renderiza el mensaje 404', () => {
    render(
      React.createElement(MemoryRouter, null, React.createElement(NotFound))
    );
    expect(screen.getByText(/404/)).toBeInTheDocument();
    expect(screen.getByText(/no existe/i)).toBeInTheDocument();
  });
});
