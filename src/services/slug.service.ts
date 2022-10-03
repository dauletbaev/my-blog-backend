import { randomBytes } from 'crypto';
import slugify from 'slugify';
import { Injectable } from '@nestjs/common';

const createHash = (length: number) => randomBytes(length).toString('hex');

@Injectable()
export class SlugService {
  slugify(s: string) {
    const hash = createHash(4);
    const slug = slugify(s, { lower: true, remove: /[*+~.()'"!:@]/g });

    return `${slug}-${hash}`;
  }

  slugifyFileName(s: string) {
    const hash = createHash(2);
    const slug = slugify(s, { lower: true, remove: /[*+~.()'"!:@]/g });

    return `${slug}-${hash}`;
  }
}
