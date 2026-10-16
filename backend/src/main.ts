import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig, CONFIG } from './app.config.provider';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/afisha');
  app.enableCors();
  const config = app.get<AppConfig>(CONFIG);
  await app.listen(config.port);
}
bootstrap();
