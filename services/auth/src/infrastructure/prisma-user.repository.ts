import { PrismaClient } from '@prisma/client';
import { User } from '../domain/user.entity.js';
import { UserRepository } from '../domain/user.repository.js';

export class PrismaUserRepository implements UserRepository {
  private prisma = new PrismaClient();

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { email: user.email },
      update: {
        password: user.passwordHash,
        name: user.name,
      },
      create: {
        id: user.id,
        email: user.email,
        password: user.passwordHash,
        name: user.name,
        role: user.role,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    if (!row) return null;
    
    return new User(
      row.id, 
      row.email, 
      row.password,
      row.name, 
      row.role,
      row.createdAt
    );
  }
}