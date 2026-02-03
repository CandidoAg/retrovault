import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InitialAdminService } from './initial-admin.service.js';
import { UserRepository } from '../domain/user.repository.js';
import * as bcrypt from 'bcrypt';

describe('InitialAdminService', () => {
  let service: InitialAdminService;
  let userRepositoryMock: UserRepository;

  vi.mock('bcrypt', () => ({
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  }));

  beforeEach(() => {
    userRepositoryMock = {
      findByEmail: vi.fn(),
      save: vi.fn(),
    } as unknown as UserRepository;

    service = new InitialAdminService(userRepositoryMock);
    
    process.env.ADMIN_EMAIL = 'admin@test.com';
    process.env.ADMIN_PASSWORD = 'password123';
    process.env.ADMIN_NAME = 'Admin Test';
  });

  it('debería crear un admin si no existe', async () => {
    vi.mocked(userRepositoryMock.findByEmail).mockResolvedValue(null);
    
    const spySave = vi.spyOn(userRepositoryMock, 'save');
    const { hash } = await import('bcrypt');

    await service.onModuleInit();

    expect(spySave).toHaveBeenCalledTimes(1);
    expect(hash).toHaveBeenCalledWith('password123', 10);
    
    const savedUser = spySave.mock.calls[0][0];
    expect(savedUser.email).toBe('admin@test.com');
  });

  it('NO debería crear un admin si ya existe', async () => {
    vi.mocked(userRepositoryMock.findByEmail).mockResolvedValue({ id: '1' } as any);
    
    const spySave = vi.spyOn(userRepositoryMock, 'save');

    await service.onModuleInit();

    expect(spySave).not.toHaveBeenCalled();
  });

  it('debería saltar la provisión si faltan variables de entorno', async () => {
    delete process.env.ADMIN_EMAIL;
    
    const spyFindByEmail = vi.spyOn(userRepositoryMock, 'findByEmail');

    await service.onModuleInit();

    expect(spyFindByEmail).not.toHaveBeenCalled();
  });
});