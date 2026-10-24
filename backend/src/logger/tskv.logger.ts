import { Injectable, LogLevel } from '@nestjs/common';

import { FormatLogger } from './format.logger';

@Injectable()
export class TskvLogger extends FormatLogger {
  formatMessage(
    level: LogLevel,
    message: unknown,
    ...optionalParams: unknown[]
  ): string {
    const fields: Record<string, string> = {
      level,
      message: this.stringify(message),
    };
    if (optionalParams.length > 0) {
      fields.optionalParams = this.stringify(optionalParams);
    }
    return Object.entries(fields)
      .map(([key, value]) => `${key}=${this.escape(value)}`)
      .join('\t');
  }

  private stringify(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }
    return JSON.stringify(value) ?? String(value);
  }

  private escape(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }
}
