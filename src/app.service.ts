import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  checkStatus() {
    return { ok: true };
  }
}
