import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { SlugService } from '~/services/slug.service';
import { PrismaService } from '~/services/prisma.service';
import { SanitizeHtmlService } from '~/services/sanitize-html.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [PostsController],
  providers: [PostsService, SlugService, PrismaService, SanitizeHtmlService],
})
export class PostsModule {}
