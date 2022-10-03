import { Injectable } from '@nestjs/common';
import { BadRequestException } from '~/exceptions';
import { MailService } from '~/mail/mail.service';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly mailService: MailService) {}

  async contact(contactDto: ContactDto) {
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
