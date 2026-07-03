import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** e.g. "Color", "RAM", "Storage" */
  @Column()
  name: string;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  product: Product;

  @OneToMany(() => VariantOption, (option) => option.variant, {
    cascade: true,
    eager: true,
  })
  options: VariantOption[];
}

@Entity('variant_options')
export class VariantOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** e.g. "16GB", "Space Grey" */
  @Column()
  value: string;

  /** Added to the base price when selected (XAF) */
  @Column({ type: 'int', default: 0 })
  priceModifier: number;

  @ManyToOne(() => ProductVariant, (variant) => variant.options, {
    onDelete: 'CASCADE',
  })
  variant: ProductVariant;
}
