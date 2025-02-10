import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filter/exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new ConfigService();

  app.setGlobalPrefix(config.get('API_PREFIX'));

  app.enableCors(await config.getCorsConfig());

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Q7_Hoot API')
    .setDescription('API for q7_hoot platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, documentFactory());
  await app.listen(await config.getPortConfig());
}
bootstrap();
