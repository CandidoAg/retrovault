import { User } from '../domain/user.entity.js';
import { UserRepository } from '../domain/user.repository.js';
import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InitialAdminService implements OnModuleInit {
  private readonly logger = new Logger(InitialAdminService.name);

  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
  ) {}

  async onModuleInit() {
    await new Promise(resolve => setTimeout(resolve, 5000));
    await this.provisionAdmin();
  }

  private async provisionAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME;

    if (!email || !password) {
      this.logger.warn('⚠️ ADMIN_EMAIL o ADMIN_PASSWORD no definidos en .env. Saltando provisión.');
      return;
    }

    const existingAdmin = await this.userRepository.findByEmail( email );

    if (existingAdmin) {
      this.logger.log(`👤 Admin "${email}" ya existe. Todo listo.`);
      return;
    }

    this.logger.log(`🚀 Creando Super Admin único: ${email}...`);

    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const adminUser = new User(crypto.randomUUID(), email, passwordHash, name || 'Admin', 'ADMIN', new Date());

      await this.userRepository.save(adminUser);

      this.logger.log('✅ Super Admin creado con éxito.');
    } catch (error: any) {
      this.logger.error(`❌ Error creando Admin: ${error.message}`);
    }
  }
}