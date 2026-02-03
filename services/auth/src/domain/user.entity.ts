export type UserRole = 'ADMIN' | 'USER';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly name: string,
    public readonly role: UserRole,
    public readonly createdAt: Date
  ) {
    if (!email.includes('@')) throw new Error("Invalid email format");
  }
}