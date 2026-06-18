import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HelpButton from '../../components/HelpButton';
import React from 'react';

describe('HelpButton', () => {
  it('renderiza el ícono de ayuda', () => {
    render(React.createElement(HelpButton, { onRepeatTour: vi.fn() }));
    expect(screen.getByTitle('Ayuda')).toBeInTheDocument();
  });

  it('abre el menú al hacer clic', async () => {
    const user = userEvent.setup();
    render(React.createElement(HelpButton, { onRepeatTour: vi.fn() }));
    await user.click(screen.getByTitle('Ayuda'));
    expect(screen.getByText('Repetir tutorial')).toBeInTheDocument();
  });

  it('llama onRepeatTour al hacer clic', async () => {
    const onRepeat = vi.fn();
    const user = userEvent.setup();
    render(React.createElement(HelpButton, { onRepeatTour: onRepeat }));
    await user.click(screen.getByTitle('Ayuda'));
    await user.click(screen.getByText('Repetir tutorial'));
    expect(onRepeat).toHaveBeenCalledTimes(1);
  });
});
