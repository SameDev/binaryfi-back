import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('BinaryFi API')
    .setDescription(
      'API de busca de músicas usando Busca Binária (O log n) vs Busca Sequencial (O n). ' +
        'Dataset: 114.000 músicas reais do Spotify. ' +
        'Trabalho AV3 — Estrutura de Dados.',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
