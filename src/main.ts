import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import compression from '@fastify/compress';
import helmet from '@fastify/helmet';
import { AppModule } from './app.module';
import { PrismaService } from './services/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors({
    origin: ['https://abat.me', 'https://dashboard.abat.me'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  await app.register(multipart);
  await app.register(compression, { encodings: ['gzip', 'deflate'] });
  await app.register(helmet);

  const prismaService = app.get(PrismaService);
  const configService = app.get(ConfigService);

  await prismaService.enableShutdownHooks(app);
  const port = configService.get<number | undefined>('PORT') ?? 3000;

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port, '0.0.0.0');
}

bootstrap();
