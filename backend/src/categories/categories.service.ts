import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { uniqueSlug } from '../common/utils/slugify';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  /** Full tree with product counts per category. */
  async tree() {
    const roots = await this.categoriesRepo.find({
      where: { parent: IsNull() },
      relations: { children: true },
      order: { sortOrder: 'ASC' },
    });

    const counts = await this.productsRepo
      .createQueryBuilder('product')
      .select('product.categoryId', 'categoryId')
      .addSelect('COUNT(product.id)', 'count')
      .groupBy('product.categoryId')
      .getRawMany();
    const countMap = new Map(counts.map((c) => [c.categoryId, Number(c.count)]));

    const withCount = (cat: Category): any => ({
      ...cat,
      productCount:
        (countMap.get(cat.id) || 0) +
        (cat.children || []).reduce((sum, ch) => sum + (countMap.get(ch.id) || 0), 0),
      children: (cat.children || [])
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((ch) => ({ ...ch, productCount: countMap.get(ch.id) || 0 })),
    });

    return roots.map(withCount);
  }

  async findBySlug(slug: string) {
    const category = await this.categoriesRepo.findOne({
      where: { slug },
      relations: { children: true, parent: true },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(data: any) {
    const slug =
      data.slug ||
      (await uniqueSlug(data.name, async (s) =>
        Boolean(await this.categoriesRepo.findOne({ where: { slug: s } })),
      ));
    const category = this.categoriesRepo.create({
      name: data.name,
      slug,
      image: data.image,
      description: data.description,
      sortOrder: data.sortOrder || 0,
      parent: data.parentId ? ({ id: data.parentId } as Category) : null,
    });
    return this.categoriesRepo.save(category);
  }

  async update(id: string, data: any) {
    const category = await this.categoriesRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    const { parentId, ...fields } = data;
    Object.assign(category, fields);
    if (parentId !== undefined) {
      category.parent = parentId ? ({ id: parentId } as Category) : null;
    }
    return this.categoriesRepo.save(category);
  }

  async remove(id: string) {
    await this.categoriesRepo.delete(id);
    return { deleted: true };
  }
}
