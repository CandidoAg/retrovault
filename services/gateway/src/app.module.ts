import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthMiddleware } from './auth.middleware.js'; 
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    })
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/*path', method: RequestMethod.ALL },
        { path: 'catalog', method: RequestMethod.GET },
        { path: 'webhooks/stripe', method: RequestMethod.POST } 
      )
      .forRoutes(
        { path: 'orders', method: RequestMethod.ALL },
        { path: 'payments/*path', method: RequestMethod.ALL },
        { path: 'catalog', method: RequestMethod.POST },
        { path: 'catalog/*path', method: RequestMethod.DELETE }
      );
  }
}