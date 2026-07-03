import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { CartService, effectivePrice } from '../cart/cart.service';
import { CouponsService } from '../coupons/coupons.module';
import { MailService } from '../mail/mail.service';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { Order, OrderItem, OrderStatus } from './order.entity';

const FREE_SHIPPING_THRESHOLD = 50000; // XAF
const FLAT_SHIPPING_FEE = 2500; // XAF

export interface PlaceOrderDto {
  email?: string;
  items: {
    productId: string;
    quantity: number;
    variantSelection?: Record<string, string>;
  }[];
  shippingAddress: any;
  billingAddress?: any;
  paymentMethod: 'card' | 'cod' | 'mobile_money';
  couponCode?: string;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger('Orders');
  private readonly stripe: Stripe | null;

  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    @InjectRepository(Product) private readonly productsRepo: Repository<Product>,
    private readonly couponsService: CouponsService,
    private readonly cartService: CartService,
    private readonly mailService: MailService,
  ) {
    this.stripe = process.env.STRIPE_SECRET_KEY
      ? new Stripe(process.env.STRIPE_SECRET_KEY)
      : null;
  }

  private generateOrderNumber() {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `KC-${stamp}${rand}`;
  }

  async place(dto: PlaceOrderDto, userId?: string) {
    if (!dto.items?.length) throw new BadRequestException('Your cart is empty');
    if (!userId && !dto.email) {
      throw new BadRequestException('Email is required for guest checkout');
    }

    // Recompute all prices server-side and validate stock
    const orderItems: Partial<OrderItem>[] = [];
    let subtotal = 0;
    for (const line of dto.items) {
      const product = await this.productsRepo.findOne({
        where: { id: line.productId },
        relations: { variants: { options: true } },
      });
      if (!product) throw new BadRequestException(`Product not found: ${line.productId}`);
      if (product.stock < line.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }
      let unitPrice = effectivePrice(product);
      if (line.variantSelection && product.variants) {
        for (const variant of product.variants) {
          const chosen = line.variantSelection[variant.name];
          const option = (variant.options || []).find((o) => o.value === chosen);
          if (option) unitPrice += option.priceModifier || 0;
        }
      }
      const lineTotal = unitPrice * line.quantity;
      subtotal += lineTotal;
      orderItems.push({
        product,
        productName: product.name,
        productSlug: product.slug,
        image: product.images?.[0] || null,
        variantSelection: line.variantSelection || null,
        unitPrice,
        quantity: line.quantity,
        lineTotal,
      });
    }

    // Coupon
    let discount = 0;
    let couponCode: string | undefined;
    if (dto.couponCode) {
      const result = await this.couponsService.validate(dto.couponCode, subtotal);
      discount = result.discount;
      couponCode = result.code;
    }

    const shippingFee =
      subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
    const total = subtotal - discount + shippingFee;

    // Stripe PaymentIntent for card payments (when configured)
    let paymentIntentId: string | null = null;
    let clientSecret: string | null = null;
    let paymentStatus = 'pending';
    if (dto.paymentMethod === 'card') {
      if (this.stripe) {
        const intent = await this.stripe.paymentIntents.create({
          amount: total, // XAF is a zero-decimal currency
          currency: 'xaf',
          automatic_payment_methods: { enabled: true },
        });
        paymentIntentId = intent.id;
        clientSecret = intent.client_secret;
      } else {
        // Dev stub — treat card payments as instantly paid
        paymentStatus = 'paid';
      }
    }

    const order = this.ordersRepo.create({
      orderNumber: this.generateOrderNumber(),
      user: userId ? ({ id: userId } as User) : null,
      email: dto.email,
      items: orderItems as OrderItem[],
      status: 'pending',
      shippingAddress: dto.shippingAddress,
      billingAddress: dto.billingAddress || null,
      subtotal,
      discount,
      shippingFee,
      total,
      couponCode,
      paymentMethod: dto.paymentMethod,
      paymentStatus,
      paymentIntentId,
      statusHistory: [{ status: 'pending', at: new Date().toISOString() }],
    });
    const saved = await this.ordersRepo.save(order);

    // Decrement stock, bump popularity, redeem coupon, clear cart
    for (const line of dto.items) {
      await this.productsRepo.decrement({ id: line.productId }, 'stock', line.quantity);
      await this.productsRepo.increment({ id: line.productId }, 'soldCount', line.quantity);
    }
    if (couponCode) await this.couponsService.redeem(couponCode);
    if (userId) await this.cartService.clear(userId).catch(() => undefined);

    this.mailService
      .sendOrderConfirmation(saved.email, saved)
      .catch(() => undefined);

    return { order: saved, clientSecret };
  }

  /** Called by the frontend after Stripe confirms the card payment. */
  async confirmPayment(orderId: string) {
    const order = await this.findEntity(orderId);
    if (order.paymentIntentId && this.stripe) {
      const intent = await this.stripe.paymentIntents.retrieve(order.paymentIntentId);
      order.paymentStatus = intent.status === 'succeeded' ? 'paid' : 'failed';
    } else {
      order.paymentStatus = 'paid';
    }
    return this.ordersRepo.save(order);
  }

  private async findEntity(id: string) {
    const order = await this.ordersRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  myOrders(userId: string) {
    return this.ordersRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, requester?: { sub: string; role: string }) {
    const order = await this.findEntity(id);
    const isAdmin = requester && ['admin', 'superadmin'].includes(requester.role);
    if (!isAdmin && requester && order.user && order.user.id !== requester.sub) {
      throw new ForbiddenException('Not your order');
    }
    return order;
  }

  /** Public order tracking by order number (+ email for guests). */
  async track(orderNumber: string, email?: string) {
    const order = await this.ordersRepo.findOne({ where: { orderNumber } });
    if (!order) throw new NotFoundException('Order not found');
    if (email && order.email.toLowerCase() !== email.toLowerCase()) {
      throw new NotFoundException('Order not found');
    }
    return {
      orderNumber: order.orderNumber,
      status: order.status,
      statusHistory: order.statusHistory,
      trackingNumber: order.trackingNumber,
      total: order.total,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        image: i.image,
      })),
    };
  }

  async adminList(filters: {
    status?: string;
    search?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const qb = this.ordersRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .orderBy('order.createdAt', 'DESC');

    if (filters.status) qb.andWhere('order.status = :status', { status: filters.status });
    if (filters.search) {
      qb.andWhere(
        '(LOWER(order.orderNumber) LIKE :s OR LOWER(order.email) LIKE :s)',
        { s: `%${filters.search.toLowerCase()}%` },
      );
    }
    if (filters.from) qb.andWhere('order.createdAt >= :from', { from: filters.from });
    if (filters.to) qb.andWhere('order.createdAt <= :to', { to: filters.to });

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async updateStatus(id: string, status: OrderStatus, trackingNumber?: string) {
    const order = await this.findEntity(id);
    order.status = status;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    order.statusHistory = [
      ...(order.statusHistory || []),
      { status, at: new Date().toISOString() },
    ];
    const saved = await this.ordersRepo.save(order);
    this.mailService.sendOrderStatusUpdate(saved.email, saved).catch(() => undefined);
    return saved;
  }
}
