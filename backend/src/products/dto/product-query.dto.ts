import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  /** comma-separated brand slugs */
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  rating?: number;

  @IsOptional()
  @IsIn(['price_asc', 'price_desc', 'newest', 'popularity', 'rating'])
  sort?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 12;

  @IsOptional()
  @IsBoolean()
  isSale?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;
}
