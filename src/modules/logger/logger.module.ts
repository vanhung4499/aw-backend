import { DynamicModule, Logger, Module } from '@nestjs/common';
import { createLoggerProviders } from './logger.provider';

@Module({})
export class LoggerModule {
  static forRoot(): DynamicModule {
    const prefixedLoggerProviders = createLoggerProviders();
    return {
      module: LoggerModule,
      providers: [Logger, ...prefixedLoggerProviders],
      exports: [Logger, ...prefixedLoggerProviders],
    };
  }
}
