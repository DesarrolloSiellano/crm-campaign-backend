import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  // Configuración de CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });


  const swaggerConfig = new DocumentBuilder()
  .setTitle('API Híbrida con REST y Microservicios TCP')
  .setVersion('1.0')
  .setDescription(
    `Esta es una aplicación híbrida desarrollada con NestJS que combina:`)
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Ingrese el token JWT en formato Bearer',
  })
  .build();
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document); // http://localhost:PORT/api-docs

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
