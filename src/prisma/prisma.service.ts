import { Injectable, OnModuleInit,OnModuleDestroy  } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import type { PoolConfig } from 'mariadb';

function fromMysqlParts() {
  const host = process.env.MYSQLHOST ?? process.env.MYSQL_HOST;
  const port = process.env.MYSQLPORT ?? process.env.MYSQL_PORT ?? '3306';
  const user = process.env.MYSQLUSER ?? process.env.MYSQL_USER;
  const password = process.env.MYSQLPASSWORD ?? process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQLDATABASE ?? process.env.MYSQL_DATABASE;

  if (!host || !user || password === undefined || !database) return undefined;

  return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

function resolveDatabaseUrl() {
  return (
    process.env.DATABASE_URL ??
    process.env.MYSQL_URL ??
    process.env.MYSQL_URL_NON_POOLING ??
    process.env.MYSQL_PRIVATE_URL ??
    process.env.MYSQL_PUBLIC_URL ??
    process.env.MYSQLPUBLICURL ??
    fromMysqlParts()
  );
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const dbUrl = resolveDatabaseUrl();

    if (!dbUrl) {
      throw new Error(
        'Database URL is missing. Set DATABASE_URL or Railway MySQL vars (MYSQL_URL, MYSQL_URL_NON_POOLING, MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE).',
      );
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
