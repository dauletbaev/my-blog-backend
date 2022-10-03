import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileController } from './file.controller';
import { PrismaService } from '~/services/prisma.service';
import { SlugService } from '~/services/slug.service';
import { FileService } from './file.service';

@Module({
  imports: [ConfigModule],
  controllers: [FileController],
  providers: [FileService, SlugService, PrismaService],
})
export class FileModule {}
