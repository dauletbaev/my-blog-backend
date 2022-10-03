import { HttpException, Injectable } from '@nestjs/common';
import { BadRequestException, ConflictException } from '~/exceptions';
import { BcryptService } from '~/services/bcrypt.service';
import { PrismaService } from '~/services/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcrypt: BcryptService,
  ) {}

  async getMe(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const fullName = user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName;

    const result = {
      id: user.id,
      avatar: user.avatar,
      email: user.email,
      username: user.username,
      fullName,
      role: user.admin ? 'admin' : 'user',
      verified: user.verified,
    };

    return result;
  }

  async create(createUserDto: CreateUserDto, token: string = null) {
    try {
      createUserDto.password = await this.bcrypt.hash(createUserDto.password);

      const createData = !token
        ? createUserDto
        : { ...createUserDto, confirmationToken: token };

      const data = await this.prisma.user.create({
        data: createData,
      });

      const result = {
        id: data.id,
        firstName: data.firstName,
        username: data.username,
      };

      return { ok: true, result };
    } catch (error: any) {
      if (error.code === 'P2002') {
        const fields = error.meta.target.join(', ');

        throw new ConflictException(`User with "${fields}" already exists`);
      }

      throw new BadRequestException();
    }
  }

  async findAll() {
    try {
      const data = await this.prisma.user.findMany();
      const count = await this.prisma.user.count();
      const users = data.map(
        ({ id, firstName, username, email, admin, avatar, lastName }) => ({
          id,
          firstName,
          lastName,
          email,
          username,
          avatar,
          role: admin ? 'admin' : 'user',
        }),
      );

      return { users, total: count };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async findOne(where: { id?: number; email?: string }) {
    try {
      const user = await this.prisma.user.findUnique({ where });
      const result = {
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        username: user.username,
      };

      return { ok: true, result };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const data = await this.prisma.user.update({
        data: updateUserDto,
        where: { id },
      });

      const result = {
        id: data.id,
        firstName: data.firstName,
        username: data.username,
      };

      return { ok: true, result };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto) {
    const { password: oldPassword, newPassword } = updatePasswordDto;
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      const isMatch = await this.bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        throw new BadRequestException('Password is incorrect');
      }

      const password = await this.bcrypt.hash(newPassword);

      await this.prisma.user.update({
        data: { password },
        where: { id },
      });

      return { ok: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException();
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.user.delete({ where: { id } });

      return { ok: true };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async deleteMyAccount(id: number) {
    try {
      await this.prisma.post.deleteMany({ where: { authorId: id } });
      await this.prisma.user.delete({ where: { id } });

      return { ok: true };
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
