import {
  Controller,
  Get,
  Injectable,
  Module,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Repository,
  Unique,
} from 'typeorm';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

@Entity('wishlist_items')
@Unique(['userId', 'productId'])
export class WishlistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  productId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Product, { onDelete: 'CASCADE', eager: true })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;
}

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistRepo: Repository<WishlistItem>,
  ) {}

  async list(userId: string) {
    const items = await this.wishlistRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return items.map((i) => i.product);
  }

  async toggle(userId: string, productId: string) {
    const existing = await this.wishlistRepo.findOne({ where: { userId, productId } });
    if (existing) {
      await this.wishlistRepo.remove(existing);
      return { added: false };
    }
    await this.wishlistRepo.save(
      this.wishlistRepo.create({
        userId,
        productId,
        user: { id: userId } as User,
        product: { id: productId } as Product,
      }),
    );
    return { added: true };
  }
}

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.wishlistService.list(user.sub);
  }

  @Post('toggle/:productId')
  toggle(@CurrentUser() user: JwtPayload, @Param('productId') productId: string) {
    return this.wishlistService.toggle(user.sub, productId);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([WishlistItem])],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
