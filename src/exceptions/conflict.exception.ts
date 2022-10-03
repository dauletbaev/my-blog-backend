import { ConflictException as BaseException } from '@nestjs/common';

export class ConflictException extends BaseException {
  constructor(message?: string) {
    super({
      ok: false,
      statusCode: 409,
      message: message ?? 'Conflict',
    });
  }
}
