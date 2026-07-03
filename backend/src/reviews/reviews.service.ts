import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { Review } from './review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviewsRepo: Repository<Review>,
    @InjectRepository(Product) private readonly productsRepo: Repository<Product>,
  ) {}

  async byProduct(productId: string) {
    const reviews = await this.reviewsRepo.find({
      where: { product: { id: productId } },
      order: { createdAt: 'DESC' },
    });
    const breakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }));
    const average = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.createdAt,
        author: r.user ? `${r.user.firstName} ${r.user.lastName?.charAt(0) || ''}.` : 'Anonymous',
        avatar: r.user?.avatar || null,
      })),
      breakdown,
      average: Math.round(average * 10) / 10,
      total: reviews.length,
    };
  }

  async create(
    userId: string,
    data: { productId: string; rating: number; title?: string; comment: string },
  ) {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }
    const product = await this.productsRepo.findOne({ where: { id: data.productId } });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.reviewsRepo.findOne({
      where: { user: { id: userId }, product: { id: data.productId } },
    });
    if (existing) throw new BadRequestException('You have already reviewed this product');

    const review = await this.reviewsRepo.save(
      this.reviewsRepo.create({
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        user: { id: userId } as User,
        product,
      }),
    );
    await this.recalculate(product.id);
    return review;
  }

  async remove(id: string) {
    const review = await this.reviewsRepo.findOne({
      where: { id },
      relations: { product: true },
    });
    if (!review) throw new NotFoundException('Review not found');
    const productId = review.product.id;
    await this.reviewsRepo.remove(review);
    await this.recalculate(productId);
    return { deleted: true };
  }

  private async recalculate(productId: string) {
    const { avg, count } = await this.reviewsRepo
      .createQueryBuilder('review')
      .select('COALESCE(AVG(review.rating), 0)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.productId = :productId', { productId })
      .getRawOne();
    await this.productsRepo.update(productId, {
      ratings: Math.round(Number(avg) * 10) / 10,
      reviewCount: Number(count),
    });
  }
}
