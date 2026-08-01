"use server"

import { revalidatePath } from "next/cache"
import * as z from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth/dal"
import { ROLES } from "@/lib/roles"

const CreateUserSchema = z.object({
  email: z.email({ error: "Enter a valid email." }).trim(),
  fullName: z.string().trim().optional(),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." }),
  role: z.enum(ROLES, { error: "Select a role." }),
})

export type CreateUserState =
  | {
      ok: true
    }
  | {
      ok: false
      errors?: {
        email?: string[]
        fullName?: string[]
        password?: string[]
        role?: string[]
      }
      formError?: string
    }
  | undefined

export async function createUser(
  _state: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  await requireAdmin()

  const validated = CreateUserSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    password: formData.get("password"),
    role: formData.get("role"),
  })

  if (!validated.success) {
    return { ok: false, errors: z.flattenError(validated.error).fieldErrors }
  }

  const { email, fullName, password, role } = validated.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { ok: false, formError: "A user with this email already exists." }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      fullName: fullName || null,
      passwordHash,
      role,
    },
  })

  revalidatePath("/users")
  return { ok: true }
}

export async function updateUserRole(userId: string, role: string) {
  const admin = await requireAdmin()

  if (userId === admin.id) {
    throw new Error("You can't change your own role.")
  }
  if (!ROLES.includes(role as (typeof ROLES)[number])) {
    throw new Error("Invalid role.")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  revalidatePath("/users")
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin()

  if (userId === admin.id) {
    throw new Error("You can't delete your own account.")
  }

  await prisma.user.delete({ where: { id: userId } })
  revalidatePath("/users")
}
