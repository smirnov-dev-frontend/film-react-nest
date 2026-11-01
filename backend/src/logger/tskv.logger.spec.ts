import { LogLevel } from '@nestjs/common';

import { TskvLogger } from './tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;

  beforeEach(() => {
    logger = new TskvLogger();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('.formatMessage()', () => {
    it('should join key=value pairs with tab', () => {
      expect(logger.formatMessage('log', 'Server started')).toBe(
        'level=log\tmessage=Server started',
      );
    });

    it('should add optionalParams field as JSON when params are passed', () => {
      expect(logger.formatMessage('warn', 'Slow query', 'Database', 42)).toBe(
        'level=warn\tmessage=Slow query\toptionalParams=["Database",42]',
      );
    });

    it('should serialize non-string message to JSON', () => {
      expect(logger.formatMessage('debug', { id: 1 })).toBe(
        'level=debug\tmessage={"id":1}',
      );
    });

    it('should convert undefined message to string', () => {
      expect(logger.formatMessage('log', undefined)).toBe(
        'level=log\tmessage=undefined',
      );
    });

    it('should escape tabs, line breaks and backslashes inside values', () => {
      const result = logger.formatMessage(
        'error',
        'col1\tcol2\nstack line\r\\path',
      );

      expect(result).toBe(
        'level=error\tmessage=col1\\tcol2\\nstack line\\r\\\\path',
      );
      expect(result.split('\t')).toHaveLength(2);
      expect(result).not.toContain('\n');
    });
  });

  describe('log methods', () => {
    const cases: [
      keyof TskvLogger & LogLevel,
      LogLevel,
      'log' | 'error' | 'warn' | 'debug',
    ][] = [
      ['log', 'log', 'log'],
      ['error', 'error', 'error'],
      ['warn', 'warn', 'warn'],
      ['debug', 'debug', 'debug'],
      ['verbose', 'verbose', 'log'],
      ['fatal', 'fatal', 'error'],
    ];

    it.each(cases)(
      '.%s() should write %s level record to console.%s',
      (method, level, consoleMethod) => {
        const write = jest
          .spyOn(console, consoleMethod)
          .mockImplementation(() => undefined);

        logger[method]('Message', 'Context');

        expect(write).toHaveBeenCalledTimes(1);
        expect(write).toHaveBeenCalledWith(
          `level=${level}\tmessage=Message\toptionalParams=["Context"]`,
        );
      },
    );
  });
});
