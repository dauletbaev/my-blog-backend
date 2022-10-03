import { NotFoundException as BaseException } from '@nestjs/common';

export class NotFoundException extends BaseException {
  constructor(message?: string) {
    super({
      ok: false,
      statusCode: 404,
      message: message ?? 'Not found',
    });
  }
}
