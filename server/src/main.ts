import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // Validation
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });

  app.setGlobalPrefix('api'); // Global prefix

  await app.listen(process.env.PORT);
}
void bootstrap();
