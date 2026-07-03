import * as fs from 'fs';
import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CouponsModule } from './coupons/coupons.module';
import { BannersModule } from './banners/banners.module';
import { BlogModule } from './blog/blog.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { UploadModule } from './upload/upload.module';
import { MailModule } from './mail/mail.module';
import { AnalyticsModule } from './analytics/analytics.module';

const uploadPath = join(process.cwd(), process.env.UPLOAD_PATH || 'uploads');
fs.mkdirSync(uploadPath, { recursive: true });
fs.mkdirSync(join(process.cwd(), 'data'), { recursive: true });

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'dev-access-secret-change-me',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        // PostgreSQL in production (Hostinger VPS); SQLite fallback for local dev.
        if (url) {
          return {
            type: 'postgres' as const,
            url,
            autoLoadEntities: true,
            synchronize: true,
          };
        }
        return {
          type: 'better-sqlite3' as const,
          database: join(process.cwd(), 'data', 'klass.sqlite'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: uploadPath,
      serveRoot: '/uploads',
    }),
    MailModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    ReviewsModule,
    CartModule,
    WishlistModule,
    CouponsModule,
    OrdersModule,
    BannersModule,
    BlogModule,
    NewsletterModule,
    UploadModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
