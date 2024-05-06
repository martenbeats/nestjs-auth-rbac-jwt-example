import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors();

  //Open Api
  const config = new DocumentBuilder()
    .setTitle('Auth Jwt Example')
    .setDescription('Open Api Auth Jwt Example')
    .setVersion('1.0')
    .setExternalDoc('Postman Collection', '/api-json')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Serve the Swagger JSON at the '/api-json' endpoint
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.API_PORT);

  logger.log(`Api is running on port: ${process.env.API_PORT}`);
}
bootstrap();
