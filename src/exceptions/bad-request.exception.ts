import { BadRequestException as BaseException } from '@nestjs/common';

export class BadRequestException extends BaseException {
  constructor(message?: string) {
    super({
      ok: false,
      statusCode: 400,
      message: message ?? 'Something went wrong',
    });
  }
}
