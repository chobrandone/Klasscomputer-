import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  /** 'percent' or 'fixed' (XAF) */
  @Column({ type: 'varchar', default: 'percent' })
  type: 'percent' | 'fixed';

  @Column({ type: 'int' })
  value: number;

  @Column({ type: 'int', default: 0 })
  minSubtotal: number;

  /** ISO string, null = never expires */
  @Column({ type: 'varchar', nullable: true })
  expiresAt: string | null;

  @Column({ type: 'int', nullable: true })
  usageLimit: number | null;

  @Column({ type: 'int', default: 0 })
  usedCount: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
