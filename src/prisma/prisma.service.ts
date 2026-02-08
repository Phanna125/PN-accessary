import { Injectable, OnModuleInit,OnModuleDestroy  } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import type { PoolConfig } from 'mariadb';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      // Fail fast if .env not loaded
      throw new Error('DATABASE_URL is missing. Check your .env file.');
    }

    const url = new URL(dbUrl);

    const allowPublicKeyRetrieval =
      url.searchParams.get('allowPublicKeyRetrieval') === 'true';
    const sslParam = url.searchParams.get('ssl');
    const ssl =
      sslParam === null ? undefined : sslParam !== 'false';

    const poolConfig: PoolConfig = {
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace('/', ''),
      connectionLimit: 5,
      ...(allowPublicKeyRetrieval ? { allowPublicKeyRetrieval: true } : {}),
      ...(sslParam !== null ? { ssl } : {}),
    };

    const adapter = new PrismaMariaDb(poolConfig);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
