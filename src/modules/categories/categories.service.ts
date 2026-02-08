import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(name: string) {
    try {
      return await this.prisma.category.create({ data: { name } });
    } catch {
      throw new BadRequestException('Category already exists');
    }
  }

  async update(id: string, name: string) {
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Category not found');

    try {
      return await this.prisma.category.update({
        where: { id },
        data: { name },
      });
    } catch {
      throw new BadRequestException('Category already exists');
    }
  }

  async remove(id: string) {
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Category not found');

    await this.prisma.category.delete({ where: { id } });
    return { deleted: true };
  }
}
