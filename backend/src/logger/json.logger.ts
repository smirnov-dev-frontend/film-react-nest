import { Injectable, LogLevel } from '@nestjs/common';

import { FormatLogger } from './format.logger';

@Injectable()
export class JsonLogger extends FormatLogger {
  formatMessage(
    level: LogLevel,
    message: unknown,
    ...optionalParams: unknown[]
  ): string {
    return JSON.stringify({ level, message, optionalParams });
  }
}
