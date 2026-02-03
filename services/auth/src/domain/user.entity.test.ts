import { describe, it, expect } from 'vitest';
import { User } from './user.entity.js';

describe('User Entity', () => {
  it('should create a valid user instance', () => {
    const user = new User(
      '1',
      'test@example.com',
      'hashed_password',
      'John Doe',
      'USER',
      new Date()
    );
    expect(user.email).toBe('test@example.com');
  });

  it('should throw error if email is invalid', () => {
    expect(() => {
      new User('1', 'invalid-email', 'hash', 'Name', 'USER' ,new Date());
    }).toThrow("Invalid email format");
  });
});