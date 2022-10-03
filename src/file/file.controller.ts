import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '~/auth/guards/jwt-auth.guard';
import { BadRequestException } from '~/exceptions';
import { User } from '~/users/decorators/user.decorator';
import { File } from './file.decorator';
import { FileGuard } from './file.guard';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('avatar')
  @UseGuards(JwtAuthGuard, FileGuard)
  @HttpCode(HttpStatus.OK)
  async uploadImage(@User() user: any, @File() file: Storage.MultipartFile) {
    const result = await this.fileService.uploadImage(file);

    if (result.ok) {
      await this.fileService.addUrlToUserAvatar(+user.id, result.url);
      return result;
    }

    throw new BadRequestException('Could not upload image');
  }

  @Delete('avatar')
  @UseGuards(JwtAuthGuard)
  async delete(@User() user: any, @Query('path') path: string) {
    await this.fileService.checkUserCanDeleteObject(+user.id, path);

    const result = await this.fileService.delete(path);

    if (result.ok) {
      await this.fileService.deleteFromUserAvatar(+user.id);
      return { ok: true };
    }

    throw new BadRequestException('Error deleting file');
  }
}
