import { ConfigService } from '@nestjs/config';

export const CONFIG = 'CONFIG';

export const DATABASE_DRIVERS = ['postgres'] as const;

export type DatabaseDriver = (typeof DATABASE_DRIVERS)[number];

const parseDriver = (value: string): DatabaseDriver => {
  const driver = DATABASE_DRIVERS.find((item) => item === value);
  if (!driver) {
    throw new Error(
      `DATABASE_DRIVER должен быть одним из: ${DATABASE_DRIVERS.join(', ')}`,
    );
  }
  return driver;
};

export const validateEnv = (
  env: Record<string, string>,
): Record<string, string> => {
  parseDriver(env.DATABASE_DRIVER);
  return env;
};

export const configProvider = {
  provide: CONFIG,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): AppConfig => ({
    port: Number(configService.get<string>('PORT', '3000')),
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
