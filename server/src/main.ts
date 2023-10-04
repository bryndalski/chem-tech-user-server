import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  ); // Validation
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });

  app.setGlobalPrefix('api'); // Global prefix
  const config = new DocumentBuilder()
    .setTitle('User server example')
    .setDescription('APi documentation for user server')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT);
}
void bootstrap();
