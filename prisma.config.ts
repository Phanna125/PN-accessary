import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.MYSQL_URL ??
  process.env.MYSQL_PRIVATE_URL ??
  process.env.MYSQL_PUBLIC_URL;

if (!databaseUrl) {
  throw new Error(
    "Missing database URL. Set DATABASE_URL or Railway MySQL vars (MYSQL_URL / MYSQL_PRIVATE_URL / MYSQL_PUBLIC_URL).",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: databaseUrl,
  },
});
