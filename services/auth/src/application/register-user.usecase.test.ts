import { describe, it, expect, vi } from 'vitest';
import { RegisterUser } from './register-user.usecase.js';
import { UserRepository } from '../domain/user.repository.js';

describe('RegisterUser Use Case', () => {
  const mockRepository: UserRepository = {
    save: vi.fn(),
    findByEmail: vi.fn().mockResolvedValue(null),
  };

  it('should hash the password before saving', async () => {
    const useCase = new RegisterUser(mockRepository);
    const passwordPlain = "123456";
    
    await useCase.execute("Candi", "candi@test.com", passwordPlain);
    const savedUser = vi.mocked(mockRepository.save).mock.calls[0][0];
    
    expect(savedUser.passwordHash).not.toBe(passwordPlain);
    expect(savedUser.passwordHash).toMatch(/^\$2[ayb]\$.+/);
    expect(savedUser.name).toBe("Candi");
  });
});