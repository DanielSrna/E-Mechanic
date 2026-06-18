import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssistButton from '../../components/AssistButton';
import React from 'react';

const mockApi = { post: vi.fn() };

vi.mock('../../api/axios', () => ({
  default: { post: (...args) => mockApi.post(...args) },
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

describe('AssistButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el botón de mensaje', () => {
    render(React.createElement(AssistButton));
    expect(screen.getByTitle('Asistencia')).toBeInTheDocument();
  });

  it('abre el panel al hacer clic', async () => {
    const user = userEvent.setup();
    render(React.createElement(AssistButton));
    await user.click(screen.getByTitle('Asistencia'));
    expect(screen.getByPlaceholderText(/Describe tu duda/)).toBeInTheDocument();
  });

  it('envía la solicitud con descripción válida', async () => {
    const user = userEvent.setup();
    mockApi.post.mockResolvedValueOnce({ data: { message: 'ok' } });

    render(React.createElement(AssistButton));
    await user.click(screen.getByTitle('Asistencia'));
    await user.type(screen.getByPlaceholderText(/Describe tu duda/), 'Necesito ayuda con una orden');
    await user.click(screen.getByText('Enviar'));

    expect(mockApi.post).toHaveBeenCalledWith('/notifications/request-assistance', {
      description: 'Necesito ayuda con una orden',
    });
  });

  it('no envía con descripción vacía', async () => {
    const user = userEvent.setup();
    render(React.createElement(AssistButton));
    await user.click(screen.getByTitle('Asistencia'));

    const btn = screen.getByText('Enviar');
    expect(btn).toBeDisabled();
  });
});
