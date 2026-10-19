import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './app';

describe('App', () => {
  it('renders the booking page', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Календарь звонков' })).toBeTruthy();
  });
});
