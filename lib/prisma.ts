import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

let _client: PrismaClient | null = null;

function getClient(): PrismaClient {
  if (_client) return _client;

  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) throw new Error("TURSO_DATABASE_URL is not set in environment variables.");

  const adapter = new PrismaLibSql({ url, ...(authToken ? { authToken } : {}) });
  _client = new PrismaClient({ adapter } as never);
  return _client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getClient();
    const value = client[prop as keyof PrismaClient];
    return typeof value === "function" ? (value as Function).bind(client) : value;
  },
});
