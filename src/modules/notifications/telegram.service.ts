import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: { include: { product: true } }; user: true };
}>;

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly enabled: boolean;
  private readonly botToken?: string;
  private readonly chatId?: string;

  constructor(private config: ConfigService) {
    this.enabled = this.isEnabled(config.get<string>('TELEGRAM_ENABLED'));
    this.botToken = config.get<string>('TELEGRAM_BOT_TOKEN');
    this.chatId = config.get<string>('TELEGRAM_CHAT_ID');
  }

  async notifyOrderCreated(order: OrderWithItems) {
    if (!this.enabled) return;
    if (!this.botToken || !this.chatId) {
      this.logger.warn(
        'Telegram is enabled but TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing.',
      );
      return;
    }

    const message = this.buildOrderMessage(order);
    await this.sendMessage(message);
  }

  private async sendMessage(text: string) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: this.chatId,
            text,
          }),
        },
      );

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        this.logger.warn(
          `Telegram send failed (${response.status} ${response.statusText}). ${body}`,
        );
      }
    } catch (error) {
      this.logger.warn(`Telegram send failed: ${String(error)}`);
    }
  }

  private buildOrderMessage(order: OrderWithItems) {
    const lines: string[] = [];
    const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;
    const fallback = (value?: string | null) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : 'Not provided';
    };

    const shippingLines: string[] = [];
    if (order.shippingStreet) shippingLines.push(order.shippingStreet);
    if (order.shippingHouse) shippingLines.push(order.shippingHouse);

    const cityProvinceDistrict = [
      order.shippingCityProvince,
      order.shippingDistrict,
    ]
      .filter(Boolean)
      .join(', ');
    if (cityProvinceDistrict) shippingLines.push(cityProvinceDistrict);

    lines.push('New order created');
    lines.push(`Order ID: ${order.id}`);
    lines.push(`Status: ${order.status}`);
    lines.push(`Total: ${formatMoney(order.totalCents)}`);
    lines.push(`Created: ${order.createdAt.toISOString()}`);
    lines.push('');
    lines.push('Customer');
    lines.push(`Name: ${fallback(order.user?.name)}`);
    lines.push(`Email: ${fallback(order.user?.email)}`);
    lines.push('');
    lines.push('Shipping');
    lines.push(`Name: ${fallback(order.shippingName || order.user?.name)}`);
    lines.push(`Phone: ${fallback(order.shippingPhone)}`);
    lines.push('Address:');
    lines.push(shippingLines.length ? shippingLines.join('\n') : 'Not provided');
    lines.push('');
    lines.push('Items');
    order.items.forEach((item, index) => {
      lines.push(
        `${index + 1}. ${item.product.title} x${item.quantity} @ ${formatMoney(
          item.priceCents,
        )}`,
      );
    });

    return lines.join('\n');
  }

  private isEnabled(value?: string) {
    return ['1', 'true', 'yes', 'on'].includes((value ?? '').toLowerCase());
  }
}
