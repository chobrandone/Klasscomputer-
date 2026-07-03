import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './address.entity';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Address) private readonly addressRepo: Repository<Address>,
  ) {}

  findByEmail(email: string, withPassword = false): Promise<User | null> {
    const qb = this.usersRepo
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email });
    if (withPassword) {
      qb.addSelect(['user.passwordHash', 'user.resetToken', 'user.resetTokenExpiry']);
    }
    return qb.getOne();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: { addresses: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  create(data: Partial<User>): Promise<User> {
    return this.usersRepo.save(this.usersRepo.create(data));
  }

  async updateProfile(id: string, data: Partial<User>): Promise<User> {
    const allowed: Partial<User> = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      avatar: data.avatar,
    };
    Object.keys(allowed).forEach(
      (k) => allowed[k] === undefined && delete allowed[k],
    );
    await this.usersRepo.update(id, allowed);
    return this.findById(id);
  }

  async setPassword(id: string, passwordHash: string) {
    await this.usersRepo.update(id, {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    });
  }

  async setResetToken(id: string, token: string, expiry: Date) {
    await this.usersRepo.update(id, {
      resetToken: token,
      resetTokenExpiry: expiry.toISOString(),
    });
  }

  /** Admin: list all customers with aggregate order stats. */
  async listCustomers(search?: string) {
    const qb = this.usersRepo
      .createQueryBuilder('user')
      .leftJoin('orders', 'o', 'o.userId = user.id')
      .select('user.id', 'id')
      .addSelect('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('user.email', 'email')
      .addSelect('user.phone', 'phone')
      .addSelect('user.role', 'role')
      .addSelect('user.createdAt', 'createdAt')
      .addSelect('COUNT(o.id)', 'orderCount')
      .addSelect('COALESCE(SUM(o.total), 0)', 'totalSpend')
      .groupBy('user.id')
      .orderBy('user.createdAt', 'DESC');
    if (search) {
      qb.where(
        '(LOWER(user.email) LIKE :s OR LOWER(user.firstName) LIKE :s OR LOWER(user.lastName) LIKE :s)',
        { s: `%${search.toLowerCase()}%` },
      );
    }
    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      ...r,
      orderCount: Number(r.orderCount),
      totalSpend: Number(r.totalSpend),
    }));
  }

  // ── Addresses ──────────────────────────────────────────────
  async listAddresses(userId: string) {
    return this.addressRepo.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC' },
    });
  }

  async addAddress(userId: string, data: Partial<Address>) {
    const address = this.addressRepo.create({ ...data, user: { id: userId } as User });
    return this.addressRepo.save(address);
  }

  async updateAddress(userId: string, id: string, data: Partial<Address>) {
    const address = await this.addressRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!address) throw new NotFoundException('Address not found');
    Object.assign(address, data);
    return this.addressRepo.save(address);
  }

  async removeAddress(userId: string, id: string) {
    await this.addressRepo.delete({ id, user: { id: userId } });
    return { deleted: true };
  }
}
