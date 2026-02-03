import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Usa process.env.JWT_SECRET para no dejar el secreto en el código
      jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_super_seguro') as any;
      
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}