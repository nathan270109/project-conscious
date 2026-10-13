import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { corsOrigin } from './config/cors.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.enableCors({ origin: corsOrigin });
  app.enableShutdownHooks();
  // Canal privado do processo pai, sem endpoint HTTP de desligamento.
  if (process.send) {
    process.on('message', (message: unknown) => {
      if (message === 'conscious:shutdown') {
        void app
          .close()
          .then(() => process.exit(0))
          .catch(() => process.exit(1));
      }
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  if (process.env.HOST)
    await app.listen(process.env.PORT ?? 3000, process.env.HOST);
  else await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();
