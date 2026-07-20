import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock useActionState
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useActionState: vi.fn().mockImplementation((action, initialState) => {
      return [initialState, vi.fn()];
    }),
  };
});

// Mock actions
vi.mock('@/actions/auth', () => ({
  authenticate: vi.fn(),
  register: vi.fn(),
}));

import LoginPage from '../src/app/login/page';
import RegisterPage from '../src/app/register/page';

describe('Auth Pages', () => {
  it('deve renderizar a pagina de login', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
  });

  it('deve renderizar a pagina de registro', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('heading', { name: 'Criar Conta' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
  });
});
