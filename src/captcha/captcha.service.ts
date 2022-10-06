import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { BadRequestException } from '~/exceptions';

@Injectable()
export class CaptchaService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async verify(token: string) {
    const secret = this.configService.get<string>('RECAPTCHA_SERVER_KEY');
    const url = `https://www.google.com/recaptcha/api/siteverify`;

    try {
      const response = await lastValueFrom(
        this.httpService.post(url, {
          secret,
          response: token,
        }),
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException('Captcha verification failed');
    }
  }
}
