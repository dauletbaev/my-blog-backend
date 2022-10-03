import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '~/auth/guards/jwt-auth.guard';
import { Roles } from '~/auth/decorators/roles.decorator';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '~/users/decorators/user.decorator';
import { User as UserEntity } from '~/users/entities/user.entity';
import { CommentDto } from './dto/comment.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createPostDto: CreatePostDto, @User() user: UserEntity) {
    return this.postsService.create(createPostDto, user);
  }

  @Post('publish/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async publish(@Param('id') id: string, @User() user: UserEntity) {
    return this.postsService.publishPost(+id, user);
  }

  @Post('unpublish/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unpublish(@Param('id') id: string, @User() user: UserEntity) {
    return this.postsService.publishPost(+id, user, true);
  }

  @Get()
  @Roles('admin')
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('orderBy') orderBy?: string,
    @Query('ascOrDesc') ascOrDesc?: string,
  ) {
    const order = ascOrDesc === 'desc' ? 'desc' : 'asc';

    return this.postsService.findAll({
      take: parseInt(limit ?? '10', 10),
      skip: parseInt(offset ?? '0', 10),
      orderBy: orderBy ? { [orderBy]: order } : {},
    });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async myPosts(
    @User() user: UserEntity,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('orderBy') orderBy?: string,
    @Query('ascOrDesc') ascOrDesc?: string,
    @Query('published') published?: string,
  ) {
    const order = ascOrDesc === 'desc' ? 'desc' : 'asc';

    return this.postsService.findAll(
      {
        take: parseInt(limit ?? '10', 10),
        skip: parseInt(offset ?? '0', 10),
        orderBy: orderBy ? { [orderBy]: order } : {},
      },
      {
        authorId: user.id,
        published: published ? published === 'true' : undefined,
      },
    );
  }

  @Get('my/:id')
  @UseGuards(JwtAuthGuard)
  findOneOfMine(@Param('id') id: string) {
    const idOrSlug = isNaN(+id) ? id : +id;

    return this.postsService.findOne(idOrSlug, false);
  }

  @Patch('my/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @User() user: UserEntity,
  ) {
    const idOrSlug = isNaN(+id) ? id : +id;

    return this.postsService.update(idOrSlug, updatePostDto, user);
  }

  @Delete('my/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @User() user: UserEntity) {
    return this.postsService.remove(+id, user);
  }

  @Get('feed')
  async feed(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('orderBy') orderBy?: string,
    @Query('ascOrDesc') ascOrDesc?: string,
  ) {
    const order = ascOrDesc === 'desc' ? 'desc' : 'asc';

    return this.postsService.getPublishedPosts({
      take: parseInt(limit ?? '10', 10),
      skip: parseInt(offset ?? '0', 10),
      orderBy: orderBy ? { [orderBy]: order } : {},
    });
  }

  @Get('search/:searchString')
  async findMatch(@Param('searchString') query: string) {
    return this.postsService.getFilteredPosts(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const idOrSlug = isNaN(+id) ? id : +id;

    return this.postsService.findOne(idOrSlug);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async like(@Param('id') id: string, @User() user: UserEntity) {
    return this.postsService.like(+id, user);
  }

  @Post(':id/comment')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async comment(
    @Param('id') id: string,
    @Body() commentDto: CommentDto,
    @User() user: UserEntity,
  ) {
    return this.postsService.comment(+id, commentDto, user);
  }
}
