import { describe, it, expect, vi } from 'vitest';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginUser } from './login-user.usecase.js';
import { UserRepository } from '../domain/user.repository.js';
import { User } from '../domain/user.entity.js';

describe('LoginUser Use Case', () => {
  const JWT_SECRET = 'test_secret_key';
  const passwordPlain = '123456';
  const passwordHash = bcrypt.hashSync(passwordPlain, 10);
  const testUser = new User('user-123','test@example.com',passwordHash,'Test User',new Date());

  const mockRepository: UserRepository = {
    save: vi.fn(),
    findByEmail: vi.fn().mockResolvedValue(testUser),
  };

  it('should return a valid JWT token when credentials are correct', async () => {
    const useCase = new LoginUser(mockRepository, JWT_SECRET);
    const result = await useCase.execute('test@example.com', passwordPlain);

    expect(result.token).toBeDefined();
    
    const decoded = jwt.verify(result.token, JWT_SECRET) as any;
    expect(decoded.userId).toBe(testUser.id);
    expect(decoded.email).toBe(testUser.email);
  });

  it('should throw error if user is not found', async () => {
    vi.mocked(mockRepository.findByEmail).mockResolvedValueOnce(null);
    const useCase = new LoginUser(mockRepository, JWT_SECRET);

    await expect(useCase.execute('wrong@example.com', 'any')).rejects.toThrow('Invalid credentials');
  });

  it('should throw error if password does not match', async () => {
    const useCase = new LoginUser(mockRepository, JWT_SECRET);
    await expect(useCase.execute('test@example.com', 'wrong_password')).rejects.toThrow('Invalid credentials');
  });
});