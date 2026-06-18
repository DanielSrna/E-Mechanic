import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Field from '../../components/ui/Field';
import React from 'react';

describe('Field', () => {
  it('renderiza el label', () => {
    render(React.createElement(Field, { label: 'Nombre', value: '', onChange: () => {} }));
    expect(screen.getByText('Nombre')).toBeInTheDocument();
  });

  it('renderiza input con type correcto', () => {
    render(React.createElement(Field, { label: 'Email', type: 'email', value: '', onChange: () => {} }));
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
  });

  it('es requerido por defecto', () => {
    render(React.createElement(Field, { label: 'X', value: '', onChange: () => {} }));
    expect(screen.getByLabelText('X')).toBeRequired();
  });

  it('puede ser opcional', () => {
    render(React.createElement(Field, { label: 'X', value: '', onChange: () => {}, required: false }));
    expect(screen.getByLabelText('X')).not.toBeRequired();
  });

  it('llama onChange al escribir', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(React.createElement(Field, { label: 'Test', value: '', onChange }));
    await user.type(screen.getByLabelText('Test'), 'hola');
    expect(onChange).toHaveBeenCalled();
  });

  it('muestra placeholder', () => {
    render(React.createElement(Field, { label: 'P', value: '', onChange: () => {}, placeholder: 'Escribe...' }));
    expect(screen.getByPlaceholderText('Escribe...')).toBeInTheDocument();
  });
});
