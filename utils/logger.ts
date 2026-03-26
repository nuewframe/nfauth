export type LogLevel = 'none' | 'info' | 'debug';

export interface LoggingOptions {
  logLevel?: string;
  verbose?: boolean;
}

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  info(message: string, ...args: unknown[]) {
    if (this.level !== 'none') {
      console.log(`ℹ️  ${message}`, ...args);
    }
  }

  debug(message: string, ...args: unknown[]) {
    if (this.level === 'debug') {
      console.log(`🔍 ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]) {
    console.error(`❌ ${message}`, ...args);
  }

  success(message: string, ...args: unknown[]) {
    if (this.level !== 'none') {
      console.log(`✅ ${message}`, ...args);
    }
  }
}

function normalizeLogLevel(value?: string, verbose?: boolean): LogLevel {
  if (value === 'none' || value === 'info' || value === 'debug') {
    return value;
  }
  if (verbose) {
    return 'debug';
  }
  return 'info';
}

export function createLoggerFromOptions(options: LoggingOptions = {}): Logger {
  return new Logger(normalizeLogLevel(options.logLevel, options.verbose));
}
