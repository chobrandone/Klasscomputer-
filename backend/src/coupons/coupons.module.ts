import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Coupon } from './coupon.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon) private readonly couponsRepo: Repository<Coupon>,
  ) {}

  findAll() {
    return this.couponsRepo.find({ order: { createdAt: 'DESC' } });
  }

  /** Validates a coupon and returns the discount for a given subtotal. */
  async validate(code: string, subtotal: number) {
    const coupon = await this.couponsRepo.findOne({
      where: { code: code.toUpperCase() },
    });
    if (!coupon || !coupon.active) throw new BadRequestException('Invalid coupon code');
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new BadRequestException('This coupon has expired');
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }
    if (subtotal < coupon.minSubtotal) {
      throw new BadRequestException(
        `Minimum order of ${coupon.minSubtotal.toLocaleString()} XAF required`,
      );
    }
    const discount =
      coupon.type === 'percent'
        ? Math.round((subtotal * coupon.value) / 100)
        : Math.min(coupon.value, subtotal);
    return { code: coupon.code, type: coupon.type, value: coupon.value, discount };
  }

  async redeem(code: string) {
    await this.couponsRepo.increment({ code: code.toUpperCase() }, 'usedCount', 1);
  }

  async create(data: any) {
    return this.couponsRepo.save(
      this.couponsRepo.create({ ...data, code: String(data.code).toUpperCase() }),
    );
  }

  async update(id: string, data: any) {
    const coupon = await this.couponsRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    Object.assign(coupon, data);
    if (data.code) coupon.code = String(data.code).toUpperCase();
    return this.couponsRepo.save(coupon);
  }

  async remove(id: string) {
    await this.couponsRepo.delete(id);
    return { deleted: true };
  }
}

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  @HttpCode(200)
  validate(@Body() body: { code: string; subtotal: number }) {
    return this.couponsService.validate(body.code, body.subtotal || 0);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.couponsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() body: any) {
    return this.couponsService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) {
    return this.couponsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Coupon])],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
