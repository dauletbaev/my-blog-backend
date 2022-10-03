import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwtDecode from 'jwt-decode';
import { User as UserEntity } from '~/users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    try {
      const token = authHeader.split(' ')[1];

      const user = jwtDecode.default(token, {
        header: false,
      }) as UserEntity;

      return roles.includes(user.role);
    } catch (error) {
      throw new UnauthorizedException();
      return false;
    }
  }
}
