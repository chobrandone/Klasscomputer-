import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Repository,
  UpdateDateColumn,
} from 'typeorm';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { uniqueSlug } from '../common/utils/slugify';

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  excerpt: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ type: 'simple-json', nullable: true })
  tags: string[];

  @Column({ default: true })
  published: boolean;

  @Column({ default: 'Klass Computer' })
  author: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost) private readonly blogRepo: Repository<BlogPost>,
  ) {}

  async list(options: { all?: boolean; tag?: string; page?: number; limit?: number }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 9, 30);
    const qb = this.blogRepo.createQueryBuilder('post').orderBy('post.createdAt', 'DESC');
    if (!options.all) qb.where('post.published = :pub', { pub: true });
    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    const filtered = options.tag
      ? items.filter((p) => (p.tags || []).includes(options.tag))
      : items;
    return { items: filtered, total, page, pages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const post = await this.blogRepo.findOne({ where: { slug, published: true } });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async findById(id: string) {
    const post = await this.blogRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async create(data: any) {
    const slug =
      data.slug ||
      (await uniqueSlug(data.title, async (s) =>
        Boolean(await this.blogRepo.findOne({ where: { slug: s } })),
      ));
    return this.blogRepo.save(this.blogRepo.create({ ...data, slug }));
  }

  async update(id: string, data: any) {
    const post = await this.findById(id);
    Object.assign(post, data);
    return this.blogRepo.save(post);
  }

  async remove(id: string) {
    await this.blogRepo.delete(id);
    return { deleted: true };
  }
}

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  list(
    @Query('all') all?: string,
    @Query('tag') tag?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.blogService.list({
      all: all === 'true',
      tag,
      page: Number(page) || 1,
      limit: Number(limit) || 9,
    });
  }

  @Get('id/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findById(@Param('id') id: string) {
    return this.blogService.findById(id);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() body: any) {
    return this.blogService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) {
    return this.blogService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost])],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
