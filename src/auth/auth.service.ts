import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { PrismaService } from '~/services/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '~/users/users.service';
import { MailService } from '~/mail/mail.service';
import { BcryptService } from '~/services/bcrypt.service';
import { BadRequestException, NotFoundException } from '~/exceptions';
import { ResetPasswordDto } from './dto/reset-password';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly mailService: MailService,
    private readonly bcrypt: BcryptService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.findByUsername(username);
    const isPasswordCorrect = await this.bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new BadRequestException('Username or password incorrect');
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const result = await this.validateUser(
      loginDto.username,
      loginDto.password,
    );

    const payload = {
      id: result.id,
      username: result.username,
      role: 'user',
    };

    const fullName = result.lastName
      ? `${result.firstName} ${result.lastName}`
      : result.firstName;

    if (result.admin) {
      payload.role = 'admin';
    }

    return {
      ok: true,
      statusCode: 200,
      accessToken: this.jwtService.sign(payload),
      user: {
        id: result.id,
        avatar: result.avatar,
        email: result.email,
        username: result.username,
        fullName,
        role: payload.role,
        verified: result.verified,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, firstName, lastName, username, password, confirmPassword } =
      registerDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Password is not confirmed');
    }

    const token = randomBytes(32).toString('hex');
    const fullName = !lastName ? firstName : `${firstName} ${lastName}`;

    try {
      const { result } = await this.userService.create(
        {
          email,
          firstName,
          lastName,
          password,
          username,
        },
        token,
      );

      await this.mailService.sendUserConfirmation({ email, fullName }, token);

      const user = {
        id: result.id,
        avatar: null,
        email,
        username,
        fullName,
        role: 'user',
        verified: false,
      };

      return {
        ok: true,
        statusCode: 200,
        accessToken: this.jwtService.sign({
          id: result.id,
          username,
          role: 'user',
        }),
        user,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException();
    }
  }

  async confirm(token: string) {
    const where = { confirmationToken: token };
    try {
      const user = await this.prisma.user.findFirst({
        where,
      });

      if (!user) {
        throw new BadRequestException();
      }

      await this.prisma.user.updateMany({
        data: { verified: true, confirmationToken: null },
        where,
      });

      return { ok: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException();
    }
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const token = randomBytes(32).toString('hex');

      await this.prisma.user.update({
        where: { email },
        data: { confirmationToken: token },
      });

      await this.mailService.sendForgotPasswordEmail(email, token);

      return { ok: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException('Something went wrong');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password, passwordConfirmation } = resetPasswordDto;

    if (password !== passwordConfirmation) {
      throw new BadRequestException('Password is not confirmed');
    }

    try {
      const user = await this.prisma.user.findFirst({
        where: { confirmationToken: token },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const hashedPassword = await this.bcrypt.hash(password);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          confirmationToken: null,
        },
      });

      return { ok: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException('Something went wrong');
    }
  }

  async check(value?: string, emailCheck = true) {
    const key = emailCheck ? 'email' : 'username';

    if (!value) {
      throw new BadRequestException(`${key} is required`);
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { [key]: value },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return { ok: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException(`Cannot check ${key}`);
    }
  }
}
