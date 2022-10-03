import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface User {
  email: string;
  fullName: string;
}

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendUserConfirmation(user: User, token: string) {
    const clientUrl = this.configService.get<string>('client.url');
    const currentUrl = this.configService.get<string>('client.thisURL');
    const queryParams = new URLSearchParams({
      redirect: `${clientUrl}/auth/confirm?token=${token}`,
    });

    const url = `${currentUrl}/auth/confirm/${token}?${queryParams.toString()}`;

    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to my site! Confirm your Email',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        name: user.fullName,
        url,
      },
    });
  }

  async sendContactEmail(email: string, name: string, message: string) {
    await this.mailerService.sendMail({
      to: this.configService.get<string>('mail.myEmail'),
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'New message from contact form',
      template: './contact', // `.hbs` extension is appended automatically
      context: {
        name,
        email,
        content: message,
      },
    });
  }

  async sendForgotPasswordEmail(email: string, token: string) {
    const clientUrl = this.configService.get<string>('client.url');
    const url = `${clientUrl}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Reset your password',
      template: './reset-password', // `.hbs` extension is appended automatically
      context: {
        url,
      },
    });

    return true;
  }
}
