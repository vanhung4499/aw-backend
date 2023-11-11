import { INestApplication } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import * as expressSession from 'express-session';
import helmet from 'helmet';
import * as chalk from 'chalk';
import { join } from 'path';
import { urlencoded, json } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IConfig } from '../../common';
import { getConfig, setConfig, environment as env } from '../../config';
import { AuthGuard } from '../shared';
import { SharedModule } from '../shared';

export async function bootstrap(
  pluginConfig?: Partial<IConfig>,
): Promise<INestApplication> {
  const config = await registerPluginConfig(pluginConfig);

  const { BootstrapModule } = await import('./bootstrap.module');
  const app = await NestFactory.create<NestExpressApplication>(
    BootstrapModule,
    {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    },
  );

  // This will lock all routes and make them accessible by authenticated users only.
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new AuthGuard(reflector));

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders:
      'Authorization, Language, Tenant-Id, Organization-Id, X-Requested-With, X-Auth-Token, X-HTTP-Method-Override, Content-Type, Content-Language, Accept, Accept-Language, Observe',
  });

  app.use(
    expressSession({
      secret: env.EXPRESS_SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
    }),
  );

  app.use(helmet());
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const options = new DocumentBuilder()
    .setTitle('AW API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swg', app, document);

  let { port, host } = config.apiConfigOptions;
  if (!port) {
    port = 3000;
  }
  if (!host) {
    host = '0.0.0.0';
  }

  console.log(chalk.green(`Configured Host: ${host}`));
  console.log(chalk.green(`Configured Port: ${port}`));

  console.log(
    chalk.green(`Swagger UI available at http://${host}:${port}/swg`),
  );

  /**
   * Dependency injection with class-validator
   */
  useContainer(app.select(SharedModule), { fallbackOnErrors: true });

  await app.listen(port, host, () => {
    const message = `Listening at http://${host}:${port}/${globalPrefix}`;
    console.log(chalk.magenta(message));
    // Send message to parent process (desktop app)
    if (process.send) {
      process.send(message);
    }
  });

  return app;
}

/**
 * Setting the global config must be done prior to loading the Bootstrap Module.
 */
export async function registerPluginConfig(
  pluginConfig: Partial<IConfig>,
) {
  if (Object.keys(pluginConfig).length > 0) {
    setConfig(pluginConfig);
  }

  /**
   * Configure migration settings
   */
  setConfig({
    dbConnectionOptions: {
      ...getMigrationsSetting(),
    },
  });

  console.log(
    chalk.green(
      `DB Config: ${JSON.stringify(getConfig().dbConnectionOptions)}`,
    ),
  );

  const registeredConfig = getConfig();
  return registeredConfig;
}

/**
 * GET migrations directory & CLI paths
 *
 * @returns
 */
export function getMigrationsSetting() {
  console.log(`Reporting __dirname: ${__dirname}`);

  return {
    migrations: [
      // join(__dirname, '../../src/database/migrations/*{.ts,.js}'),
      join(__dirname, '../database/migrations/*{.ts,.js}'),
    ],
    cli: {
      migrationsDir: join(__dirname, '../../src/database/migrations'),
    },
  };
}
