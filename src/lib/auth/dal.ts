import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { getSessionPayload } from "@/lib/auth/session"
import { prisma } from "@/lib/db"
import type { Role } from "@/lib/roles"

export const verifySession = cache(async () => {
  const session = await getSessionPayload()
  if (!session?.userId) {
    redirect("/login")
  }
  return { userId: session.userId }
})

export const getCurrentUser = cache(async () => {
  const session = await getSessionPayload()
  if (!session?.userId) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, fullName: true, role: true },
  })
  return user as null | { id: string; email: string; fullName: string | null; role: Role }
})

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  if (user.role !== "admin") {
    redirect("/")
  }
  return user
}
