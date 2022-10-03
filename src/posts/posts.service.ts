import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { Prisma } from '@prisma/client';
import { BadRequestException, NotFoundException } from '~/exceptions';
import { PrismaService } from '~/services/prisma.service';
import { SlugService } from '~/services/slug.service';
import { SanitizeHtmlService } from '~/services/sanitize-html.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CommentDto } from './dto/comment.dto';
import { User as UserEntity } from '~/users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slugService: SlugService,
    private readonly sanitizeHtml: SanitizeHtmlService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createPostDto: CreatePostDto, user: UserEntity) {
    const slug = this.slugService.slugify(createPostDto.title);
    const content = this.sanitizeHtml.sanitize(createPostDto.content);

    try {
      const author = await this.prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!author.verified) {
        throw new BadRequestException('You need to verify your email');
      }

      const data = await this.prisma.post.create({
        data: {
          title: createPostDto.title,
          slug,
          content,
          authorId: user.id,
        },
      });

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException("Can't create post");
    }
  }

  async findAll(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.PostWhereUniqueInput;
      orderBy?: Prisma.PostOrderByWithRelationInput;
    },
    where?: Prisma.PostWhereInput,
  ) {
    const { skip, take, cursor, orderBy } = params;
    try {
      const posts = await this.prisma.post.findMany({
        skip,
        take,
        cursor,
        orderBy,
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          likes: true,
          likeCount: true,
          published: true,
          author: { select: { firstName: true, lastName: true, avatar: true } },
        },
      });

      return posts;
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async findOne(id: string | number, onlyPublished = true) {
    const userSelect = {
      select: { firstName: true, lastName: true, avatar: true },
    };
    const selectBy = typeof id === 'number' ? 'id' : 'slug';

    const where: Prisma.PostWhereInput = { AND: { [selectBy]: id } };
    if (onlyPublished) {
      where.AND['published'] = true;
    }

    try {
      const post = await this.prisma.post.findFirst({
        where,
        include: {
          comments: {
            select: {
              id: true,
              body: true,
              user: userSelect,
              createdAt: true,
              updatedAt: true,
            },
          },
          likes: {
            select: {
              id: true,
              user: userSelect,
            },
          },
          author: userSelect,
        },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      const { authorId, published, ...returnData } = post;

      if (!onlyPublished) {
        returnData['published'] = published;
      } else {
        await this.prisma.post.updateMany({
          where: { AND: { [selectBy]: id, published: true } },
          data: { views: { increment: 1 } },
        });
      }

      return returnData;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException();
    }
  }

  async update(
    id: number | string,
    updatePostDto: UpdatePostDto,
    user: UserEntity,
  ) {
    const selectBy = typeof id === 'number' ? 'id' : 'slug';

    try {
      const author = await this.prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!author.verified) {
        throw new BadRequestException('You need to verify your email');
      }

      const post = await this.prisma.post.findFirst({
        where: { AND: { [selectBy]: id, authorId: user.id } },
      });

      if (post.title !== updatePostDto.title) {
        updatePostDto['slug'] = this.slugService.slugify(updatePostDto.title);
      }

      await this.prisma.post.updateMany({
        where: { AND: { [selectBy]: id, authorId: user.id } },
        data: updatePostDto,
      });

      await this.revalidatePost(post.slug);

      return { ok: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException("Can't update post");
    }
  }

  async remove(id: number | string, user: UserEntity) {
    const selectBy = typeof id === 'number' ? 'id' : 'slug';
    try {
      const author = await this.prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!author.verified) {
        throw new BadRequestException('You need to verify your email');
      }

      await this.prisma.post.deleteMany({
        where: { AND: { [selectBy]: id, authorId: user.id } },
      });

      return { ok: true, message: 'Post deleted sucessfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException("Can't delete post");
    }
  }

  async getPublishedPosts(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PostWhereUniqueInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, orderBy } = params;
    try {
      const posts = await this.prisma.post.findMany({
        where: { published: true },
        skip,
        take,
        cursor,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          likeCount: true,
          content: true,
          author: { select: { firstName: true, lastName: true } },
        },
      });

      const total = await this.prisma.post.count({
        where: { published: true },
      });

      const postsWithCommentsCount = await Promise.all(
        posts.map(async ({ content, ...post }) => {
          const comments = await this.prisma.comment.count({
            where: { postId: post.id },
          });

          const excerpt = this.sanitizeHtml.removeTags(content.slice(0, 300));

          return { ...post, excerpt, comments };
        }),
      );

      return { posts: postsWithCommentsCount, total };
    } catch (error) {
      throw new BadRequestException("Can't get published posts");
    }
  }

  async getFilteredPosts(searchString: string) {
    try {
      const posts = await this.prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: searchString } },
            { content: { contains: searchString } },
          ],
        },
      });

      return posts;
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async publishPost(id: number, user: UserEntity, unpublish = false) {
    try {
      await this.prisma.post.updateMany({
        data: { published: true && !unpublish },
        where: { AND: { id, authorId: user.id } },
      });

      return { ok: true };
    } catch (error) {
      const label = unpublish ? 'unpublish' : 'publish';
      throw new BadRequestException(`Can't ${label} post`);
    }
  }

  async like(id: number, user: UserEntity) {
    try {
      const exists = await this.prisma.like.findFirst({
        where: {
          postId: id,
          userId: user.id,
        },
      });

      if (!exists) {
        await this.prisma.like.create({
          data: { postId: id, userId: user.id },
        });
      } else {
        await this.prisma.like.delete({
          where: { id: exists.id },
        });
      }

      await this.prisma.post.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
      });

      return { ok: true };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async comment(id: number, commentDto: CommentDto, user: UserEntity) {
    const { body: comment } = commentDto;
    try {
      await this.prisma.comment.create({
        data: {
          body: comment,
          postId: id,
          userId: user.id,
        },
      });

      return { ok: true };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async revalidatePost(slug: string) {
    const clientUrl = this.configService.get<string>('client.url');
    const secret = this.configService.get<string>('client.revalidateSecret');

    const searchParams = new URLSearchParams({
      secret,
      path: `/blog/${slug}`,
    });

    const url = `${clientUrl}/api/revalidate?${searchParams.toString()}`;

    try {
      await lastValueFrom(this.httpService.get(url));
    } catch (error) {
      console.log(error);
    }
  }
}
