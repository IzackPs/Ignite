import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate, register, logout } from '../src/actions/auth';
import { signIn, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { AuthError } from 'next-auth';

vi.mock('next-auth', () => {
  return {
    AuthError: class AuthErrorMock extends Error {
      type: string;
      constructor(type: string) {
        super(type);
        this.name = 'AuthError';
        this.type = type;
      }
    }
  };
});

vi.mock('@/auth', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}));

describe('auth actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should call signIn with correct credentials', async () => {
      const formData = new FormData();
      formData.append('email', 'test@test.com');
      
      await authenticate(undefined, formData);
      
      expect(signIn).toHaveBeenCalledWith('credentials', formData);
    });

    it('should return error message for CredentialsSignin error', async () => {
      const error = new AuthError('CredentialsSignin');
      vi.mocked(signIn).mockRejectedValueOnce(error);
      
      const formData = new FormData();
      const result = await authenticate(undefined, formData);
      
      expect(result).toBe('Credenciais inválidas.');
    });

    it('should return generic error message for other AuthError', async () => {
      const error = new AuthError('SomeOtherError');
      vi.mocked(signIn).mockRejectedValueOnce(error);
      
      const formData = new FormData();
      const result = await authenticate(undefined, formData);
      
      expect(result).toBe('Algo deu errado.');
    });

    it('should throw non-AuthError', async () => {
      const error = new Error('Generic error');
      vi.mocked(signIn).mockRejectedValueOnce(error);
      
      const formData = new FormData();
      await expect(authenticate(undefined, formData)).rejects.toThrow('Generic error');
    });
  });

  describe('register', () => {
    it('should return error for invalid data', async () => {
      const formData = new FormData();
      formData.append('name', 'a'); // invalid, min 2
      formData.append('email', 'invalid'); // invalid email
      formData.append('password', '123'); // invalid, min 6
      
      const result = await register(undefined, formData);
      expect(result).toBe('Dados inválidos. Verifique os campos preenchidos.');
    });

    it('should return error if email already in use', async () => {
      const formData = new FormData();
      formData.append('name', 'User');
      formData.append('email', 'test@test.com');
      formData.append('password', '123456');
      
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: '1', email: 'test@test.com' } as any);
      
      const result = await register(undefined, formData);
      expect(result).toBe('Este e-mail já está em uso.');
    });

    it('should create user and sign in on success', async () => {
      const formData = new FormData();
      formData.append('name', 'User');
      formData.append('email', 'test@test.com');
      formData.append('password', '123456');
      
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      vi.mocked(bcryptjs.hash).mockResolvedValueOnce('hashed_password' as any);
      vi.mocked(prisma.user.create).mockResolvedValueOnce({ id: '1' } as any);
      
      await register(undefined, formData);
      
      expect(bcryptjs.hash).toHaveBeenCalledWith('123456', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'User',
          email: 'test@test.com',
          password: 'hashed_password',
        },
      });
      expect(signIn).toHaveBeenCalledWith('credentials', formData);
    });

    it('should handle signIn error after successful registration', async () => {
      const formData = new FormData();
      formData.append('name', 'User');
      formData.append('email', 'test@test.com');
      formData.append('password', '123456');
      
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      vi.mocked(bcryptjs.hash).mockResolvedValueOnce('hashed_password' as any);
      
      const error = new AuthError('CredentialsSignin');
      vi.mocked(signIn).mockRejectedValueOnce(error);
      
      const result = await register(undefined, formData);
      expect(result).toBe('Erro ao fazer login automático após registro.');
    });

    it('should handle generic AuthError during registration', async () => {
      const formData = new FormData();
      formData.append('name', 'User');
      formData.append('email', 'test@test.com');
      formData.append('password', '123456');
      
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      vi.mocked(bcryptjs.hash).mockResolvedValueOnce('hashed_password' as any);
      
      const error = new AuthError('OtherError');
      vi.mocked(signIn).mockRejectedValueOnce(error);
      
      const result = await register(undefined, formData);
      expect(result).toBe('Algo deu errado durante o registro.');
    });

    it('should throw non-AuthError during registration', async () => {
      const formData = new FormData();
      formData.append('name', 'User');
      formData.append('email', 'test@test.com');
      formData.append('password', '123456');
      
      vi.mocked(prisma.user.findUnique).mockRejectedValueOnce(new Error('DB failure'));
      
      await expect(register(undefined, formData)).rejects.toThrow('DB failure');
    });
  });

  describe('logout', () => {
    it('should call signOut', async () => {
      await logout();
      expect(signOut).toHaveBeenCalledWith({ redirectTo: '/login' });
    });
  });
});
