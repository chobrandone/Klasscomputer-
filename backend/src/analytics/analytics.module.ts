import {
  Controller,
  Get,
  Injectable,
  Module,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { MoreThan, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    @InjectRepository(Product) private readonly productsRepo: Repository<Product>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async dashboard() {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const orders = await this.ordersRepo.find({
      where: { createdAt: MoreThanOrEqual(monthStart) },
    });
    const valid = orders.filter((o) => o.status !== 'cancelled');
    const totalRevenue = valid.reduce((sum, o) => sum + o.total, 0);

    const [totalOrders, newCustomers, productsInStock] = await Promise.all([
      this.ordersRepo.count(),
      this.usersRepo.count({
        where: { createdAt: MoreThanOrEqual(monthStart), role: 'customer' },
      }),
      this.productsRepo.count({ where: { stock: MoreThan(0) } }),
    ]);

    const recentOrders = await this.ordersRepo.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const topProducts = await this.productsRepo.find({
      where: { soldCount: MoreThan(0) },
      order: { soldCount: 'DESC' },
      take: 5,
    });

    const lowStock = await this.productsRepo
      .createQueryBuilder('product')
      .where('product.stock < 5')
      .orderBy('product.stock', 'ASC')
      .take(10)
      .getMany();

    return {
      kpis: {
        totalRevenue,
        monthOrders: valid.length,
        totalOrders,
        newCustomers,
        productsInStock,
      },
      recentOrders,
      topProducts,
      lowStock,
    };
  }

  /** Daily sales for the last 30 days, or monthly for the last 12 months. */
  async salesChart(range: 'daily' | 'monthly' = 'daily') {
    const since = new Date();
    if (range === 'monthly') since.setMonth(since.getMonth() - 11, 1);
    else since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const orders = await this.ordersRepo.find({
      where: { createdAt: MoreThanOrEqual(since), status: Not('cancelled') },
    });

    const buckets = new Map<string, { revenue: number; orders: number }>();
    const cursor = new Date(since);
    const now = new Date();
    while (cursor <= now) {
      const key =
        range === 'monthly'
          ? cursor.toISOString().slice(0, 7)
          : cursor.toISOString().slice(0, 10);
      buckets.set(key, { revenue: 0, orders: 0 });
      if (range === 'monthly') cursor.setMonth(cursor.getMonth() + 1);
      else cursor.setDate(cursor.getDate() + 1);
    }
    for (const order of orders) {
      const created = new Date(order.createdAt).toISOString();
      const key = range === 'monthly' ? created.slice(0, 7) : created.slice(0, 10);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.revenue += order.total;
        bucket.orders += 1;
      }
    }
    return Array.from(buckets.entries()).map(([date, values]) => ({ date, ...values }));
  }

  topProducts() {
    return this.productsRepo.find({ order: { soldCount: 'DESC' }, take: 10 });
  }
}

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  dashboard() {
    return this.analyticsService.dashboard();
  }

  @Get('sales-chart')
  salesChart(@Query('range') range?: 'daily' | 'monthly') {
    return this.analyticsService.salesChart(range === 'monthly' ? 'monthly' : 'daily');
  }

  @Get('top-products')
  topProducts() {
    return this.analyticsService.topProducts();
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, User])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
