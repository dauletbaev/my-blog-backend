import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as jwtDecode from 'jwt-decode';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.user) {
      const authHeader = request.headers['authorization'];
      const token = authHeader.replace('Bearer ', '');
      const user = jwtDecode.default(token) as any;

      return user;
    }

    return request.user;
  },
);
