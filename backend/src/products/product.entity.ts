import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Brand } from '../brands/brand.entity';
import { Category } from '../categories/category.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index({ unique: true })
  @Column()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  shortDescription: string;

  /** Prices stored as whole XAF (no decimals in CFA francs) */
  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'int', nullable: true })
  salePrice: number | null;

  @Column({ default: false })
  isSale: boolean;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ nullable: true })
  sku: string;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ type: 'simple-json', nullable: true })
  images: string[];

  @Column({ type: 'simple-json', nullable: true })
  specifications: Record<string, string>;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  isNewArrival: boolean;

  @Column({ default: false })
  isTopSeller: boolean;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL', eager: true })
  category: Category | null;

  @ManyToOne(() => Brand, { nullable: true, onDelete: 'SET NULL', eager: true })
  brand: Brand | null;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];

  @Column({ type: 'float', default: 0 })
  ratings: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  /** Used for popularity sorting and top-products analytics */
  @Column({ type: 'int', default: 0 })
  soldCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
