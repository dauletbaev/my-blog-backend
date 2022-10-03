import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants/constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '~/services/prisma.service';
import { UsersService } from '~/users/users.service';
import { MailModule } from '~/mail/mail.module';
import { BcryptService } from '~/services/bcrypt.service';

@Module({
  imports: [
    MailModule,
    JwtModule.register({
      secret: jwtConstants().secret,
      signOptions: { expiresIn: jwtConstants().expiresIn },
    }),
  ],
  providers: [
    AuthService,
    UsersService,
    BcryptService,
    PrismaService,
    JwtStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
