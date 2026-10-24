import { ConfigService } from '@nestjs/config';

export const CONFIG = 'CONFIG';

export const DATABASE_DRIVERS = ['postgres'] as const;

export const LOGGER_TYPES = ['dev', 'json', 'tskv'] as const;

export type DatabaseDriver = (typeof DATABASE_DRIVERS)[number];

export type LoggerType = (typeof LOGGER_TYPES)[number];

const parseOption = <T extends string>(
  name: string,
  value: string,
  allowed: readonly T[],
): T => {
  const option = allowed.find((item) => item === value);
  if (!option) {
    throw new Error(`${name} должен быть одним из: ${allowed.join(', ')}`);
  }
  return option;
};

const parseDriver = (value: string): DatabaseDriver =>
  parseOption('DATABASE_DRIVER', value, DATABASE_DRIVERS);

const parseLoggerType = (value = 'dev'): LoggerType =>
  parseOption('LOGGER_TYPE', value, LOGGER_TYPES);

export const validateEnv = (
  env: Record<string, string>,
): Record<string, string> => {
  parseDriver(env.DATABASE_DRIVER);
  parseLoggerType(env.LOGGER_TYPE);
  return env;
};

export const configProvider = {
  provide: CONFIG,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): AppConfig => ({
    port: Number(configService.get<string>('PORT', '3000')),
    loggerType: parseLoggerType(configService.get<string>('LOGGER_TYPE')),
    database: {
      driver: parseDriver(configService.get<string>('DATABASE_DRIVER')),
      host: configService.get<string>('DATABASE_HOST', 'localhost'),
      port: Number(configService.get<string>('DATABASE_PORT', '5432')),
      name: configService.get<string>('DATABASE_NAME', 'films'),
      username: configService.get<string>('DATABASE_USERNAME'),
      password: configService.get<string>('DATABASE_PASSWORD'),
    },
  }),
};

export interface AppConfig {
  port: number;
  loggerType: LoggerType;
  database: AppConfigDatabase;
}

export interface AppConfigDatabase {
  driver: DatabaseDriver;
  host: string;
  port: number;
  name: string;
  username: string;
  password: string;
}
