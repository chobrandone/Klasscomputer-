import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';
import { RefreshToken } from './refresh-token.entity';

const sha256 = (value: string) =>
  crypto.createHash('sha256').update(value).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,
  ) {}

  private async issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: (process.env.JWT_ACCESS_TTL || '15m') as any,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
      expiresIn: (process.env.JWT_REFRESH_TTL || '7d') as any,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshRepo.save(
      this.refreshRepo.create({
        tokenHash: sha256(refreshToken),
        user,
        expiresAt: expiresAt.toISOString(),
      }),
    );
    return { accessToken, refreshToken };
  }

  sanitize(user: User) {
    const { passwordHash, resetToken, resetTokenExpiry, ...safe } = user as any;
    return safe;
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('An account with this email already exists');

    const user = await this.usersService.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      passwordHash: await bcrypt.hash(dto.password, 10),
      role: 'customer',
    });

    this.mailService.sendWelcome(user).catch(() => undefined);
    const tokens = await this.issueTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email, true);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const tokens = await this.issueTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('No refresh token');
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.refreshRepo.findOne({
      where: { tokenHash: sha256(refreshToken), revoked: false },
      relations: { user: true },
    });
    if (!stored || new Date(stored.expiresAt) < new Date()) {
      throw new UnauthorizedException('Refresh token revoked or expired');
    }

    // Rotate: revoke old token, issue a new pair
    stored.revoked = true;
    await this.refreshRepo.save(stored);
    const user = await this.usersService.findById(payload.sub);
    const tokens = await this.issueTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.refreshRepo.update(
        { tokenHash: sha256(refreshToken) },
        { revoked: true },
      );
    }
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    return this.sanitize(user);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    // Always return success to avoid leaking which emails exist
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await this.usersService.setResetToken(
        user.id,
        sha256(token),
        new Date(Date.now() + 60 * 60 * 1000),
      );
      this.mailService.sendPasswordReset(user, token).catch(() => undefined);
    }
    return { success: true, message: 'If that email exists, a reset link was sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email, true);
    if (
      !user ||
      !user.resetToken ||
      user.resetToken !== sha256(dto.token) ||
      new Date(user.resetTokenExpiry) < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    await this.usersService.setPassword(user.id, await bcrypt.hash(dto.password, 10));
    return { success: true };
  }
}
