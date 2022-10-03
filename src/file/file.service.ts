import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import { Upload } from '@aws-sdk/lib-storage';
import { S3, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { SlugService } from '~/services/slug.service';
import { PrismaService } from '~/services/prisma.service';
import { BadRequestException } from '~/exceptions';

type File = Storage.MultipartFile;

@Injectable()
export class FileService {
  constructor(
    private readonly slugService: SlugService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async uploadImage(file: File) {
    if (!file.mimetype.includes('image')) {
      throw new BadRequestException('File is not an image');
    }

    const compressedImage = await this.compressImage(await file.toBuffer());

    const [fileName, fileExtension] = this.splitFileName(file.filename);
    const normalizedFileName = this.slugService.slugifyFileName(fileName);
    const date = new Date().toISOString().split('T')[0];

    const filename = `${date}/${normalizedFileName}.${fileExtension}`;

    try {
      const url = await this.upload(compressedImage, filename);

      return { ok: true, url };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error uploading image');
    }
  }

  splitFileName(fileName: string) {
    const fileExtension = fileName.split('.').pop();
    const fileNameWithoutExtension = fileName.split('.').shift();

    return [fileNameWithoutExtension, fileExtension];
  }

  compressImage(file: Buffer) {
    return sharp(file)
      .resize(800, 800, {
        fit: 'inside',
      })
      .toBuffer();
  }

  async upload(file: Buffer, filename: string) {
    const bucketS3 = this.configService.get<string>('aws.bucketS3');

    try {
      const url = await this.uploadS3(file, bucketS3, filename);

      return url;
    } catch (error) {
      throw new BadRequestException('Error uploading file');
    }
  }

  async uploadS3(file: Buffer, bucket: string, name: string) {
    const s3 = this.getS3();
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: bucket,
        Key: name,
        Body: file,
      },
      queueSize: 3,
    });

    // upload.on('httpUploadProgress', progress => {
    //   console.log(progress);
    // });

    await upload.done();

    const url = `https://${bucket}.s3.amazonaws.com/${name}`;

    s3.destroy();

    return url;
  }

  async checkUserCanDeleteObject(userId: number, path: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (user.avatar && !user.avatar.endsWith(path)) {
      throw new ForbiddenException('You cannot delete this file');
    }
  }

  async addUrlToUserAvatar(userId: number, url: string) {
    try {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { avatar: url },
      });
    } catch (error) {
      throw new BadRequestException('Error linking file to user');
    }
  }

  async deleteFromUserAvatar(userId: number) {
    try {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { avatar: null },
      });
    } catch (error) {
      throw new BadRequestException('Error unlinking file from user');
    }
  }

  async delete(path: string) {
    const s3 = this.getS3();
    const bucketS3 = this.configService.get<string>('aws.bucketS3');

    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketS3,
        Key: path,
      });
      await s3.send(command);

      return { ok: true };
    } catch (error) {
      throw new BadRequestException('Error deleting file');
    } finally {
      s3.destroy();
    }
  }

  getS3() {
    const region = this.configService.get<string>('aws.region');
    const accessKeyId = this.configService.get<string>('aws.key');
    const secretAccessKey = this.configService.get<string>('aws.secret');

    return new S3({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
}
