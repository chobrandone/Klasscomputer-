import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from './address.entity';

export type UserRole = 'customer' | 'admin' | 'superadmin';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ type: 'varchar', default: 'customer' })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  resetToken: string | null;

  /** ISO string — kept as varchar for SQLite/Postgres portability */
  @Column({ type: 'varchar', nullable: true, select: false })
  resetTokenExpiry: string | null;

  @OneToMany(() => Address, (address) => address.user, { cascade: true })
  addresses: Address[];

  @CreateDateColumn()
  createdAt: Date;
}
