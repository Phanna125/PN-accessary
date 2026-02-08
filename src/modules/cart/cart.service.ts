import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalCents = items.reduce(
      (sum, item) => sum + item.quantity * item.product.priceCents,
      0,
    );

    return { items, totalCents };
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      throw new BadRequestException('Invalid productId');
    }

    const item = await this.prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: { quantity: { increment: quantity } },
      create: { userId, productId, quantity },
      include: { product: true },
    });

    return item;
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    const exists = await this.prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!exists) throw new NotFoundException('Cart item not found');

    return this.prisma.cartItem.update({
      where: { userId_productId: { userId, productId } },
      data: { quantity },
      include: { product: true },
    });
  }

  async removeItem(userId: string, productId: string) {
    const exists = await this.prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!exists) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } },
    });

    return { deleted: true };
  }
}
