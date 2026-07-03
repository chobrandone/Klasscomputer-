import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Home' })
  label: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  line1: string;

  @Column({ nullable: true })
  line2: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  region: string;

  @Column({ default: 'Cameroon' })
  country: string;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  user: User;
}
