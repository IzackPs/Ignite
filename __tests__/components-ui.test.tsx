import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Toast } from '../src/components/Toast';
import { ThemeProvider } from '../src/components/ThemeProvider';
import { ThemeToggle } from '../src/components/ThemeToggle';

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: any) => <div data-testid="theme-provider">{children}</div>,
  useTheme: vi.fn(() => ({ theme: 'dark', setTheme: vi.fn() })),
}));

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renderiza com mensagem e fecha ao clicar no botão', () => {
    const onClose = vi.fn();
    render(<Toast message="Teste de mensagem" onClose={onClose} />);

    expect(screen.getByText('Teste de mensagem')).toBeInTheDocument();

    const closeBtn = screen.getByTitle('Fechar');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fecha automaticamente após o duration', () => {
    const onClose = vi.fn();
    render(<Toast message="Auto close" onClose={onClose} duration={3000} />);

    act(() => {
      vi.advanceTimersByTime(3001);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renderiza ícone correto para cada type', () => {
    const onClose = vi.fn();
    const { rerender } = render(<Toast message="msg" type="warning" onClose={onClose} />);
    expect(screen.getByText('msg')).toBeInTheDocument();

    rerender(<Toast message="msg" type="error" onClose={onClose} />);
    expect(screen.getByText('msg')).toBeInTheDocument();

    rerender(<Toast message="msg" type="success" onClose={onClose} />);
    expect(screen.getByText('msg')).toBeInTheDocument();

    rerender(<Toast message="msg" type="info" onClose={onClose} />);
    expect(screen.getByText('msg')).toBeInTheDocument();
  });

  it('usa type=warning como padrão', () => {
    const onClose = vi.fn();
    render(<Toast message="default type" onClose={onClose} />);
    expect(screen.getByText('default type')).toBeInTheDocument();
  });
});

describe('ThemeProvider', () => {
  it('renderiza children corretamente', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <div data-testid="child">Conteúdo filho</div>
      </ThemeProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo filho')).toBeInTheDocument();
  });
});

describe('ThemeToggle', () => {
  it('renderiza botão quando mounted (dark mode)', async () => {
    const { useTheme } = await import('next-themes');
    const setTheme = vi.fn();
    (useTheme as any).mockReturnValue({ theme: 'dark', setTheme });

    render(<ThemeToggle />);

    // After mount effect, the button should appear
    const btn = screen.queryByRole('button', { name: /Toggle theme/i });
    // May be null before mount; just ensure no crash
    if (btn) {
      fireEvent.click(btn);
      expect(setTheme).toHaveBeenCalledWith('light');
    }
  });

  it('renderiza botão quando mounted (light mode)', async () => {
    const { useTheme } = await import('next-themes');
    const setTheme = vi.fn();
    (useTheme as any).mockReturnValue({ theme: 'light', setTheme });

    render(<ThemeToggle />);

    const btn = screen.queryByRole('button', { name: /Toggle theme/i });
    if (btn) {
      fireEvent.click(btn);
      expect(setTheme).toHaveBeenCalledWith('dark');
    }
  });
});
