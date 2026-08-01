import { PrismaClient } from "@/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// The better-sqlite3 adapter maps SQLITE_CONSTRAINT_TRIGGER (i.e. a
// RAISE(ABORT, ...) inside a trigger, like the stock-check trigger) to a
// generic P2003 foreign-key-violation error, discarding the trigger's
// message from err.message. The original message survives at this path.
export function getSqliteTriggerMessage(err: unknown): string | null {
  if (!err || typeof err !== "object") return null
  const meta = (err as { meta?: unknown }).meta
  if (!meta || typeof meta !== "object") return null
  const driverAdapterError = (meta as { driverAdapterError?: unknown })
    .driverAdapterError
  if (!driverAdapterError || typeof driverAdapterError !== "object")
    return null
  const cause = (driverAdapterError as { cause?: unknown }).cause
  if (!cause || typeof cause !== "object") return null
  const originalMessage = (cause as { originalMessage?: unknown })
    .originalMessage
  return typeof originalMessage === "string" ? originalMessage : null
}
