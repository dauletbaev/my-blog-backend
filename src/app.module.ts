import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './validation/env.validation';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { PostsModule } from './posts/posts.module';
import { MailModule } from './mail/mail.module';
import { ContactModule } from './contact/contact.module';
import { FileModule } from './file/file.module';
import mailConfig from './config/mail.config';
import clientConfig from './config/client.config';
import awsConfig from './config/aws.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [mailConfig, clientConfig, awsConfig],
      cache: false,
      validate,
    }),
    AuthModule,
    ContactModule,
    UsersModule,
    PostsModule,
    MailModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
