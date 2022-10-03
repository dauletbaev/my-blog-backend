import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { FastifyRequest } from 'fastify';

export const File = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest() as any;
    const file = req.incomingFile;
    return file;
  },
);
