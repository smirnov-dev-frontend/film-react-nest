import { LoggerService } from '@nestjs/common';

import { AppConfig, CONFIG, LoggerType } from '../app.config.provider';
import { DevLogger } from './dev.logger';
import { JsonLogger } from './json.logger';
import { TskvLogger } from './tskv.logger';

export const APP_LOGGER = 'APP_LOGGER';

const loggers: Record<LoggerType, () => LoggerService> = {
  dev: () => new DevLogger(),
  json: () => new JsonLogger(),
  tskv: () => new TskvLogger(),
};

export const loggerProvider = {
  provide: APP_LOGGER,
  inject: [CONFIG],
  useFactory: (config: AppConfig): LoggerService =>
    loggers[config.loggerType](),
};
