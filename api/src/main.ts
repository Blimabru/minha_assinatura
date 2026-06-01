import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Filtra propriedades não declaradas no DTO
      transform: true, // Converte tipos automaticamente
    }),
  );

  // Habilita CORS para permitir conexões do aplicativo mobile (emulador ou físico)
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 API Minha Assinatura rodando na porta ${port}`);
}
bootstrap();

