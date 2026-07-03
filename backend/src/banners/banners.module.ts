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
} from 'typeorm';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 'hero' (slider) or 'promo' (full-width CTA banner) */
  @Column({ type: 'varchar', default: 'hero' })
  type: 'hero' | 'promo';

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ nullable: true })
  tag: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  link: string;

  @Column({ nullable: true })
  ctaLabel: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;
}

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner) private readonly bannersRepo: Repository<Banner>,
  ) {}

  findActive(type?: string) {
    return this.bannersRepo.find({
      where: type ? { active: true, type: type as any } : { active: true },
      order: { sortOrder: 'ASC' },
    });
  }

  findAll() {
    return this.bannersRepo.find({ order: { type: 'ASC', sortOrder: 'ASC' } });
  }

  create(data: any) {
    return this.bannersRepo.save(this.bannersRepo.create(data));
  }

  async update(id: string, data: any) {
    const banner = await this.bannersRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    Object.assign(banner, data);
    return this.bannersRepo.save(banner);
  }

  async remove(id: string) {
    await this.bannersRepo.delete(id);
    return { deleted: true };
  }
}

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  findActive(@Query('type') type?: string, @Query('all') all?: string) {
    return all === 'true' ? this.bannersService.findAll() : this.bannersService.findActive(type);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() body: any) {
    return this.bannersService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) {
    return this.bannersService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Banner])],
  controllers: [BannersController],
  providers: [BannersService],
})
export class BannersModule {}
