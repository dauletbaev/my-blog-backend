import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import { BadRequestException } from '~/exceptions';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('confirm/:token')
  async confirm(
    @Res() res: any,
    @Param('token') token: string,
    @Query('redirect') redirect?: string,
  ) {
    if (redirect) {
      await this.authService.confirm(token);
      return res.status(302).redirect(`${redirect}?token=${token}`);
    }

    return this.authService.confirm(token);
  }

  @Get('check-email/:email')
  async checkEmail(@Param('email') email?: string) {
    return this.authService.check(email);
  }

  @Get('check-username/:username')
  async checkUsername(@Param('username') username?: string) {
    return this.authService.check(username, false);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
}
