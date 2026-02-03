import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../domain/user.repository.js';

export class LoginUser {
  constructor(
    private userRepository: UserRepository,
    private jwtSecret: string
  ) {}

  async execute(email: string, passwordPlain: string): Promise<{ token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const isPasswordCorrect = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isPasswordCorrect) throw new Error("Invalid credentials");

    const token = jwt.sign({ userId: user.id, email: user.email, name: user.name, role: user.role },this.jwtSecret,{ expiresIn: '1h' });
    return { token };
  }
}