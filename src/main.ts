import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigin = process.env.CORS_ORIGIN;
  if (process.env.NODE_ENV === 'production' && corsOrigin) {
    app.enableCors({ origin: corsOrigin.split(',').map((o) => o.trim()) });
  } else {
    app.enableCors();
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('BinaryFi API')
    .setDescription(
      'API de busca de músicas usando Busca Binária (O log n) vs Busca Sequencial (O n). ' +
        'Dataset: 114.000 músicas reais do Spotify. ' +
        'Inclui metadados de capas, eventos de usuário e recomendações. ' +
        'Trabalho AV3 — Estrutura de Dados.',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  new Logger('Bootstrap').log(`BinaryFi API rodando em http://localhost:${port}`);
}

bootstrap().catch((err: NodeJS.ErrnoException) => {
  const logger = new Logger('Bootstrap');
  if (err.code === 'EADDRINUSE') {
    const port = process.env.PORT || 3000;
    logger.error(
      `A porta ${port} já está em uso. Feche o processo que a ocupa ou rode em outra porta (ex.: PORT=3001). Veja o README.`,
    );
  } else {
    logger.error(err);
  }
  process.exit(1);
});
