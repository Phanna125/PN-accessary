import "dotenv/config";
import { defineConfig } from "prisma/config";

function fromMysqlParts() {
  const host = process.env.MYSQLHOST ?? process.env.MYSQL_HOST;
  const port = process.env.MYSQLPORT ?? process.env.MYSQL_PORT ?? "3306";
  const user = process.env.MYSQLUSER ?? process.env.MYSQL_USER;
  const password = process.env.MYSQLPASSWORD ?? process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQLDATABASE ?? process.env.MYSQL_DATABASE;

  if (!host || !user || password === undefined || !database) return undefined;

  return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.MYSQL_URL ??
  process.env.MYSQL_URL_NON_POOLING ??
  process.env.MYSQL_PRIVATE_URL ??
  process.env.MYSQL_PUBLIC_URL ??
  process.env.MYSQLPUBLICURL ??
  fromMysqlParts();

if (!databaseUrl) {
  throw new Error(
    "Missing database URL. Set DATABASE_URL or Railway MySQL vars (MYSQL_URL, MYSQL_URL_NON_POOLING, MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE).",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: databaseUrl,
  },
});
