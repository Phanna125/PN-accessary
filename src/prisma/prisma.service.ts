import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

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
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const dbUrl = resolveDatabaseUrl();

    if (!dbUrl) {
      throw new Error(
        'Database URL is missing. Set DATABASE_URL or Railway MySQL vars (MYSQL_URL, MYSQL_URL_NON_POOLING, MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE).',
      );
    }

    const adapter = new PrismaMariaDb(dbUrl);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      this.logger.error(
        `Initial Prisma connection failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
