import { LoggerService } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig, CONFIG } from './app.config.provider';
import { configureApp } from './configure-app';
import { APP_LOGGER } from './logger/logger.provider';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get<LoggerService>(APP_LOGGER));
  configureApp(app);
  const config = app.get<AppConfig>(CONFIG);
  await app.listen(config.port);
}
bootstrap();
