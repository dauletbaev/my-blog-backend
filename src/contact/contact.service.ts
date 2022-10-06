import { Injectable } from '@nestjs/common';
import { CaptchaService } from '~/captcha/captcha.service';
import { BadRequestException } from '~/exceptions';
import { MailService } from '~/mail/mail.service';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(
    private readonly mailService: MailService,
    private readonly captchaService: CaptchaService,
  ) {}

  async contact(contactDto: ContactDto) {
    await this.captchaService.verify(contactDto.token);

    try {
      await this.mailService.sendContactEmail(
        contactDto.email,
        contactDto.name,
        contactDto.message,
      );

      return { ok: true };
    } catch (error) {
      throw new BadRequestException('Error sending email');
    }
  }
}
