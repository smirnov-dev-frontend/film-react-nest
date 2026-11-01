import { LogLevel } from '@nestjs/common';

import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;

  beforeEach(() => {
    logger = new JsonLogger();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('.formatMessage()', () => {
    it('should return JSON with level, message and empty optionalParams', () => {
      const result = logger.formatMessage('log', 'Server started');

      expect(JSON.parse(result)).toEqual({
        level: 'log',
        message: 'Server started',
        optionalParams: [],
      });
    });

    it('should put optional params into optionalParams array as is', () => {
      const result = logger.formatMessage('warn', 'Slow query', 'Database', {
        ms: 1200,
      });

      expect(JSON.parse(result)).toEqual({
        level: 'warn',
        message: 'Slow query',
        optionalParams: ['Database', { ms: 1200 }],
      });
    });

    it('should keep non-string message as JSON value', () => {
      const result = logger.formatMessage('debug', { id: 1, seats: [1, 2] });

      expect(JSON.parse(result).message).toEqual({ id: 1, seats: [1, 2] });
    });

    it('should return a single line', () => {
      const result = logger.formatMessage('error', 'line 1\nline 2');

      expect(result).not.toContain('\n');
    });
  });

  describe('log methods', () => {
    const cases: [
      keyof JsonLogger & LogLevel,
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
      '.%s() should write %s level message to console.%s',
      (method, level, consoleMethod) => {
        const write = jest
          .spyOn(console, consoleMethod)
          .mockImplementation(() => undefined);

        logger[method]('Message', 'Context');

        expect(write).toHaveBeenCalledTimes(1);
        expect(write).toHaveBeenCalledWith(
          JSON.stringify({
            level,
            message: 'Message',
            optionalParams: ['Context'],
          }),
        );
      },
    );
  });
});
