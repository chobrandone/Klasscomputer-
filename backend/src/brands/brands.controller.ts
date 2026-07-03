import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { uniqueSlug } from '../common/utils/slugify';
import { Brand } from './brand.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand) private readonly brandsRepo: Repository<Brand>,
  ) {}

  findAll() {
    return this.brandsRepo.find({ order: { name: 'ASC' } });
  }

  async create(data: any) {
    const slug =
      data.slug ||
      (await uniqueSlug(data.name, async (s) =>
        Boolean(await this.brandsRepo.findOne({ where: { slug: s } })),
      ));
    return this.brandsRepo.save(this.brandsRepo.create({ ...data, slug }));
  }

  async update(id: string, data: any) {
    const brand = await this.brandsRepo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    Object.assign(brand, data);
    return this.brandsRepo.save(brand);
  }

  async remove(id: string) {
    await this.brandsRepo.delete(id);
    return { deleted: true };
  }
}

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  findAll() {
    return this.brandsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() body: any) {
    return this.brandsService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) {
    return this.brandsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
