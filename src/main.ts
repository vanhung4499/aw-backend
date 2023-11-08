import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  app.use(helmet());

  app.setGlobalPrefix('/api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use(cookieParser());

  app.enableCors({
    origin: configService.get('app.frontendURL'),
    credentials: true,
  });

  const swaggerConfig = configService.get('swagger');
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger/v1', app, document);

  await app.listen(configService.get('app.port'));
}

bootstrap();
