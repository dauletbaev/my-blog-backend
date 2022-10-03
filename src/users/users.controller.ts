import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '~/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '~/auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from './decorators/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@User() user: any) {
    return this.usersService.getMe(+user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@User() user: any, @Body() updateDataDto: UpdateUserDto) {
    return this.usersService.update(user.id, updateDataDto);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @User() user: any,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(user.id, updatePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteMyAccount(@User() user: any) {
    return this.usersService.deleteMyAccount(+user.id);
  }

  @Get()
  @Roles('admin')
  async findAll() {
    return this.usersService.findAll();
  }

  // @Get(':id')
  // @Roles('admin')
  // async findOne(@Param('id') id: string) {
  //   return this.usersService.findOne({ id: Number(id) });
  // }

  @Patch(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
