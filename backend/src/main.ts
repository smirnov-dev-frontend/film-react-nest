import {
  BadRequestException,
  LoggerService,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { AppConfig, CONFIG } from './app.config.provider';
import { APP_LOGGER } from './logger/logger.provider';

const collectMessages = (errors: ValidationError[]): string[] =>
  errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...collectMessages(error.children ?? []),
  ]);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get<LoggerService>(APP_LOGGER));
  app.setGlobalPrefix('api/afisha');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          error: collectMessages(errors).join('; '),
        }),
    }),
  );
  const config = app.get<AppConfig>(CONFIG);
  await app.listen(config.port);
}
bootstrap();
