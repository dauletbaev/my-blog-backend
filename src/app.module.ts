import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
import { AnalyticsModule } from './analytics/analytics.module';
import { CaptchaModule } from './captcha/captcha.module';
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
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: parseInt(
          config.get<string | undefined>('THROTTLE_TTL') || '60',
          10,
        ),
        limit: parseInt(
          config.get<string | undefined>('THROTTLE_LIMIT') || '20',
          10,
        ),
      }),
    }),
    AuthModule,
    ContactModule,
    UsersModule,
    PostsModule,
    MailModule,
    FileModule,
    AnalyticsModule,
    CaptchaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
