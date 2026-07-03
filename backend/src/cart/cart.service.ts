import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { CartItem } from './cart-item.entity';

export function variantPriceModifier(product: Product, selection?: Record<string, string> | null) {
  if (!selection || !product.variants) return 0;
  let modifier = 0;
  for (const variant of product.variants) {
    const chosen = selection[variant.name];
    if (!chosen) continue;
    const option = (variant.options || []).find((o) => o.value === chosen);
    if (option) modifier += option.priceModifier || 0;
  }
  return modifier;
}

export function effectivePrice(product: Product) {
  return product.isSale && product.salePrice ? product.salePrice : product.price;
}

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem) private readonly cartRepo: Repository<CartItem>,
    @InjectRepository(Product) private readonly productsRepo: Repository<Product>,
  ) {}

  async getCart(userId: string) {
    const items = await this.cartRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'ASC' },
    });
    const detailed = items.map((item) => {
      const unitPrice = effectivePrice(item.product);
      return { ...item, unitPrice, lineTotal: unitPrice * item.quantity };
    });
    const subtotal = detailed.reduce((sum, i) => sum + i.lineTotal, 0);
    return { items: detailed, subtotal, count: detailed.reduce((s, i) => s + i.quantity, 0) };
  }

  async add(
    userId: string,
    productId: string,
    quantity = 1,
    variantSelection?: Record<string, string>,
  ) {
    const product = await this.productsRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.stock < 1) throw new BadRequestException('Product is out of stock');

    const existing = (
      await this.cartRepo.find({ where: { user: { id: userId }, product: { id: productId } } })
    ).find(
      (i) =>
        JSON.stringify(i.variantSelection || {}) === JSON.stringify(variantSelection || {}),
    );

    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock);
      await this.cartRepo.save(existing);
    } else {
      await this.cartRepo.save(
        this.cartRepo.create({
          user: { id: userId } as User,
          product,
          quantity: Math.min(quantity, product.stock),
          variantSelection: variantSelection || null,
        }),
      );
    }
    return this.getCart(userId);
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    const item = await this.cartRepo.findOne({
      where: { id: itemId, user: { id: userId } },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    if (quantity < 1) {
      await this.cartRepo.remove(item);
    } else {
      item.quantity = Math.min(quantity, item.product.stock);
      await this.cartRepo.save(item);
    }
    return this.getCart(userId);
  }

  async remove(userId: string, itemId: string) {
    await this.cartRepo.delete({ id: itemId, user: { id: userId } });
    return this.getCart(userId);
  }

  async clear(userId: string) {
    await this.cartRepo.delete({ user: { id: userId } });
    return this.getCart(userId);
  }

  /** Merge a guest (localStorage) cart into the user's DB cart after login. */
  async merge(
    userId: string,
    items: { productId: string; quantity: number; variantSelection?: Record<string, string> }[],
  ) {
    for (const item of items || []) {
      try {
        await this.add(userId, item.productId, item.quantity, item.variantSelection);
      } catch {
        /* skip unavailable products */
      }
    }
    return this.getCart(userId);
  }
}
