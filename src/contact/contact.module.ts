import { Module } from '@nestjs/common';
import { CaptchaModule } from '~/captcha/captcha.module';
import { MailModule } from '~/mail/mail.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [MailModule, CaptchaModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
