import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../../components/ErrorBoundary';
import React from 'react';

function BrokenComponent() {
  throw new Error('Test error');
}

function GoodComponent() {
  return React.createElement('div', null, 'Todo bien');
}

describe('ErrorBoundary', () => {
  it('renderiza children normalmente', () => {
    render(
      React.createElement(ErrorBoundary, null, React.createElement(GoodComponent))
    );
    expect(screen.getByText('Todo bien')).toBeInTheDocument();
  });

  it('muestra fallback cuando un child lanza error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      React.createElement(ErrorBoundary, null, React.createElement(BrokenComponent))
    );
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('Recargar')).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});
