import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramService } from '../notifications/telegram.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private telegram: TelegramService,
  ) {}

  async createFromCart(userId: string, shipping: CreateOrderDto) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const totalCents = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.priceCents,
      0,
    );

    const order = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          totalCents,
          shippingName: normalizeOptional(shipping.shippingName),
          shippingPhone: normalizeOptional(shipping.shippingPhone),
          shippingStreet: normalizeOptional(shipping.shippingStreet),
          shippingHouse: normalizeOptional(shipping.shippingHouse),
          shippingCityProvince: normalizeOptional(shipping.shippingCityProvince),
          shippingDistrict: normalizeOptional(shipping.shippingDistrict),
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceCents: item.product.priceCents,
            })),
          },
        },
        include: { items: { include: { product: true } }, user: true },
      });

      await tx.cartItem.deleteMany({ where: { userId } });
      return order;
    });

    void this.telegram.notifyOrderCreated(order);
    return order;
  }

  listForUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  listAll() {
    return this.prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    const exists = await this.prisma.order.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: { include: { product: true } } },
    });
  }
}

function normalizeOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
