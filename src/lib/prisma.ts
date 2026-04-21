import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function warnOnServerlessDatabaseUrl(url?: string) {
  if (!url || process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    return
  }

  if (!url.includes("pgbouncer=true")) {
    console.warn(
      "DATABASE_URL deberia usar pgbouncer=true para despliegues serverless."
    )
  }

  if (!url.includes("connection_limit=")) {
    console.warn(
      "DATABASE_URL deberia incluir connection_limit=1 para despliegues serverless."
    )
  }
}

warnOnServerlessDatabaseUrl(process.env.DATABASE_URL)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
