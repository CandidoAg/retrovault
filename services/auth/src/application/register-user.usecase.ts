import bcrypt from 'bcrypt';
import { User } from '../domain/user.entity.js';
import { UserRepository } from '../domain/user.repository.js';
import { UserRole } from '@prisma/client';

export class RegisterUser {
  constructor(private userRepository: UserRepository) {}

  async execute(name: string, email: string, passwordPlain: string): Promise<void> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new Error("User already exists");

    const passwordHash = await bcrypt.hash(passwordPlain, 10);

    const user = new User(crypto.randomUUID(),email,passwordHash,name, UserRole.USER, new Date());
    await this.userRepository.save(user);
  }
}