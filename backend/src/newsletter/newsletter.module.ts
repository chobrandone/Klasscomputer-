import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Injectable,
  Module,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { IsEmail } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Repository,
} from 'typeorm';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';

@Entity('newsletter_subscribers')
export class Subscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;
}

class SubscribeDto {
  @IsEmail()
  email: string;
}

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Subscriber)
    private readonly subscribersRepo: Repository<Subscriber>,
    private readonly mailService: MailService,
  ) {}

  async subscribe(email: string) {
    const existing = await this.subscribersRepo.findOne({
      where: { email: email.toLowerCase() },
    });
    if (existing) throw new ConflictException('You are already subscribed!');
    await this.subscribersRepo.save(
      this.subscribersRepo.create({ email: email.toLowerCase() }),
    );
    this.mailService.sendNewsletterConfirmation(email).catch(() => undefined);
    return { success: true, message: 'Welcome aboard! Check your inbox.' };
  }

  list() {
    return this.subscribersRepo.find({ order: { createdAt: 'DESC' } });
  }
}

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @HttpCode(200)
  subscribe(@Body() dto: SubscribeDto) {
    return this.newsletterService.subscribe(dto.email);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  list() {
    return this.newsletterService.list();
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber]), MailModule],
  controllers: [NewsletterController],
  providers: [NewsletterService],
})
export class NewsletterModule {}
