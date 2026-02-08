import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findAll(params?: {
    search?: string
    categoryId?: string
    page?: number
    limit?: number
    includeInactive?: boolean
  }) {
    const search = params?.search?.trim();
    const categoryId = params?.categoryId?.trim();
    const includeInactive = params?.includeInactive ?? false;

    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? Math.min(params.limit, 50) : 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    // If your Prisma schema uses relation connect (recommended):
    if (categoryId) {
      where.category = { id: categoryId };
      // OR (if your schema has categoryId scalar):
      // where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    const cat = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!cat) throw new BadRequestException('Invalid categoryId');

    return this.prisma.product.create({
      data: {
        title: dto.title,
        description: dto.description,
        priceCents: dto.priceCents,
        sku: dto.sku,
        stock: dto.stock,
        isActive: dto.isActive ?? true,
        imageUrl: dto.imageUrl,

        // IMPORTANT: Use relation connect
        category: { connect: { id: dto.categoryId } },
      },
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Product not found');

    if (dto.categoryId) {
      const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!cat) throw new BadRequestException('Invalid categoryId');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        priceCents: dto.priceCents,
        sku: dto.sku,
        stock: dto.stock,
        isActive: dto.isActive,
        imageUrl: dto.imageUrl,

        ...(dto.categoryId ? { category: { connect: { id: dto.categoryId } } } : {}),
      },
      include: { category: true },
    });
  }

  async remove(id: string) {
    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Product not found');

    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    return { deleted: true, soft: true };
  }
}
