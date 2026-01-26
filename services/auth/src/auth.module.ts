import { Module } from '@nestjs/common';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository.js';
import { RegisterUser } from './application/register-user.usecase.js';
import { LoginUser } from './application/login-user.usecase.js';
import { AuthController } from './infrastructure/http/auth.controller.js';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: RegisterUser,
      useFactory: (repo) => new RegisterUser(repo),
      inject: ['UserRepository'],
    },
    {
      provide: LoginUser,
      useFactory: (repo) => new LoginUser(repo, process.env.JWT_SECRET!),
      inject: ['UserRepository'],
    },
  ],
})
export class AuthModule {}