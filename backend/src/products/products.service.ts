import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import { uniqueSlug } from '../common/utils/slugify';
import { ProductVariant, VariantOption } from './product-variant.entity';
import { Product } from './product.entity';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productsRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantsRepo: Repository<ProductVariant>,
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
  ) {}

  async findAll(query: ProductQueryDto) {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort,
      isSale,
      isFeatured,
      inStock,
    } = query;
    const page = query.page || 1;
    const limit = Math.min(query.limit || 12, 48);

    const qb = this.productsRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand');

    if (search) {
      qb.andWhere(
        '(LOWER(product.name) LIKE :s OR LOWER(product.shortDescription) LIKE :s OR LOWER(product.sku) LIKE :s)',
        { s: `%${search.toLowerCase()}%` },
      );
    }

    if (category) {
      // Include products in the category itself or any of its direct children
      const cat = await this.categoriesRepo.findOne({
        where: { slug: category },
        relations: { children: true },
      });
      if (cat) {
        const ids = [cat.id, ...(cat.children || []).map((c) => c.id)];
        qb.andWhere('category.id IN (:...catIds)', { catIds: ids });
      } else {
        qb.andWhere('1 = 0');
      }
    }

    if (brand) {
      qb.andWhere('brand.slug IN (:...brands)', { brands: brand.split(',') });
    }

    if (minPrice !== undefined) {
      qb.andWhere('COALESCE(product.salePrice, product.price) >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('COALESCE(product.salePrice, product.price) <= :maxPrice', { maxPrice });
    }
    if (rating !== undefined) {
      qb.andWhere('product.ratings >= :rating', { rating });
    }
    if (isSale !== undefined) qb.andWhere('product.isSale = :isSale', { isSale });
    if (isFeatured !== undefined)
      qb.andWhere('product.isFeatured = :isFeatured', { isFeatured });
    if (inStock) qb.andWhere('product.stock > 0');

    switch (sort) {
      case 'price_asc':
        qb.orderBy('COALESCE(product.salePrice, product.price)', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('COALESCE(product.salePrice, product.price)', 'DESC');
        break;
      case 'newest':
        qb.orderBy('product.createdAt', 'DESC');
        break;
      case 'rating':
        qb.orderBy('product.ratings', 'DESC');
        break;
      case 'popularity':
      default:
        qb.orderBy('product.soldCount', 'DESC').addOrderBy('product.ratings', 'DESC');
    }

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const product = await this.productsRepo.findOne({
      where: { slug },
      relations: { variants: { options: true } },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findByIds(ids: string[]) {
    if (!ids.length) return [];
    return this.productsRepo.find({ where: { id: In(ids) } });
  }

  async findById(id: string) {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: { variants: { options: true } },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  featured(limit = 8) {
    return this.productsRepo.find({
      where: { isFeatured: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  newArrivals(limit = 8) {
    return this.productsRepo.find({
      where: { isNewArrival: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  topSellers(limit = 5) {
    return this.productsRepo.find({
      where: { isTopSeller: true },
      order: { soldCount: 'DESC' },
      take: limit,
    });
  }

  onSale(limit = 8) {
    return this.productsRepo.find({
      where: { isSale: true },
      order: { updatedAt: 'DESC' },
      take: limit,
    });
  }

  async related(slug: string, limit = 8) {
    const product = await this.findBySlug(slug);
    if (!product.category) return [];
    return this.productsRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('category.id = :catId', { catId: product.category.id })
      .andWhere('product.id != :id', { id: product.id })
      .orderBy('product.soldCount', 'DESC')
      .take(limit)
      .getMany();
  }

  // ── Admin CRUD ─────────────────────────────────────────────
  async create(data: any) {
    const slug =
      data.slug ||
      (await uniqueSlug(data.name, async (s) =>
        Boolean(await this.productsRepo.findOne({ where: { slug: s } })),
      ));

    const product = this.productsRepo.create({
      ...data,
      slug,
      images: data.images || [],
      category: data.categoryId ? { id: data.categoryId } : null,
      brand: data.brandId ? { id: data.brandId } : null,
      variants: undefined,
    });
    const saved = (await this.productsRepo.save(product)) as unknown as Product;
    if (data.variants) await this.replaceVariants(saved.id, data.variants);
    return this.findById(saved.id);
  }

  async update(id: string, data: any) {
    const product = await this.findById(id);
    const { variants, categoryId, brandId, ...fields } = data;
    Object.assign(product, fields);
    if (categoryId !== undefined) {
      product.category = categoryId ? ({ id: categoryId } as Category) : null;
    }
    if (brandId !== undefined) {
      product.brand = brandId ? ({ id: brandId } as any) : null;
    }
    product.variants = undefined as any;
    await this.productsRepo.save(product);
    if (variants) await this.replaceVariants(id, variants);
    return this.findById(id);
  }

  private async replaceVariants(
    productId: string,
    variants: { name: string; options: { value: string; priceModifier?: number }[] }[],
  ) {
    await this.variantsRepo.delete({ product: { id: productId } });
    for (const v of variants) {
      const variant = this.variantsRepo.create({
        name: v.name,
        product: { id: productId } as Product,
        options: (v.options || []).map(
          (o) =>
            ({ value: o.value, priceModifier: o.priceModifier || 0 }) as VariantOption,
        ),
      });
      await this.variantsRepo.save(variant);
    }
  }

  async remove(id: string) {
    await this.productsRepo.delete(id);
    return { deleted: true };
  }

  async bulk(ids: string[], action: 'delete' | 'feature' | 'unfeature' | 'sale') {
    if (action === 'delete') {
      await this.productsRepo.delete({ id: In(ids) });
    } else if (action === 'feature') {
      await this.productsRepo.update({ id: In(ids) }, { isFeatured: true });
    } else if (action === 'unfeature') {
      await this.productsRepo.update({ id: In(ids) }, { isFeatured: false });
    } else if (action === 'sale') {
      await this.productsRepo.update({ id: In(ids) }, { isSale: true });
    }
    return { success: true };
  }
}
