import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from './prisma-user.repository.js';
import { User } from '../domain/user.entity.js';

describe('PrismaUserRepository Integration Test', () => {
  let prisma: PrismaClient;
  let repository: PrismaUserRepository;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new PrismaUserRepository();

    (repository as any).prisma = prisma;

    await prisma.user.deleteMany();
  });

  it('should save and find a user by email', async () => {
    const user = new User(
      crypto.randomUUID(),
      'test@auth.com',
      '$2b$10$hashedpassword', // Simulamos un hash de bcrypt
      'Candi Auth',
      new Date()
    );

    await repository.save(user);

    const foundUser = await repository.findByEmail('test@auth.com');

    expect(foundUser).not.toBeNull();
    expect(foundUser?.email).toBe('test@auth.com');
    expect(foundUser?.passwordHash).toBe('$2b$10$hashedpassword');
  });

  it('should return null if user does not exist', async () => {
    const foundUser = await repository.findByEmail('non-existent@test.com');
    expect(foundUser).toBeNull();
  });
});