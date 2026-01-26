import { Controller, Post, Body, HttpCode, HttpStatus, ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterUser } from '../../application/register-user.usecase.js';
import { LoginUser } from '../../application/login-user.usecase.js';

interface RegisterDto {
  name: string;
  email: string;
  passwordPlain: string;
}

interface LoginDto {
  email: string;
  passwordPlain: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUser: LoginUser,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    try {
      await this.registerUser.execute(dto.name, dto.email, dto.passwordPlain);
      return { message: 'User registered successfully' };
    } catch (error: any) {
      throw new ConflictException(error.message);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    try {
      const result = await this.loginUser.execute(dto.email, dto.passwordPlain);
      return result;
    } catch (error: any) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}