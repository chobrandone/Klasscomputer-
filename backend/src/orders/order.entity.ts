import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  country: string;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL', eager: true })
  user: User | null;

  /** Contact email (also used for guest checkout) */
  @Column()
  email: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @Column({ type: 'varchar', default: 'pending' })
  status: OrderStatus;

  @Column({ type: 'simple-json' })
  shippingAddress: OrderAddress;

  @Column({ type: 'simple-json', nullable: true })
  billingAddress: OrderAddress | null;

  @Column({ type: 'int' })
  subtotal: number;

  @Column({ type: 'int', default: 0 })
  discount: number;

  @Column({ type: 'int', default: 0 })
  shippingFee: number;

  @Column({ type: 'int' })
  total: number;

  @Column({ nullable: true })
  couponCode: string;

  /** 'card' | 'cod' | 'mobile_money' */
  @Column({ type: 'varchar', default: 'cod' })
  paymentMethod: string;

  /** 'pending' | 'paid' | 'failed' | 'refunded' */
  @Column({ type: 'varchar', default: 'pending' })
  paymentStatus: string;

  @Column({ nullable: true })
  paymentIntentId: string;

  @Column({ nullable: true })
  trackingNumber: string;

  /** Timeline of status changes: [{ status, at }] */
  @Column({ type: 'simple-json', nullable: true })
  statusHistory: { status: string; at: string }[];

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  product: Product | null;

  /** Snapshot fields — kept even if the product is later deleted */
  @Column()
  productName: string;

  @Column({ nullable: true })
  productSlug: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'simple-json', nullable: true })
  variantSelection: Record<string, string> | null;

  @Column({ type: 'int' })
  unitPrice: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  lineTotal: number;
}
