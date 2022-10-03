import * as sanitizeHtml from 'sanitize-html';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SanitizeHtmlService {
  sanitize(html: string) {
    return sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'a']),
    });
  }

  removeTags(html: string) {
    return sanitizeHtml(html, {
      allowedTags: [],
    });
  }
}
