"use server"

import { redirect } from "next/navigation"
import * as z from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { createSession, deleteSession } from "@/lib/auth/session"

const LoginSchema = z.object({
  email: z.email({ error: "Enter a valid email." }).trim(),
  password: z.string().min(1, { error: "Password is required." }),
})

export type LoginState =
  | {
      errors?: { email?: string[]; password?: string[] }
      formError?: string
    }
  | undefined

export async function login(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const validated = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors }
  }

  const { email, password } = validated.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { formError: "Invalid email or password." }
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatches) {
    return { formError: "Invalid email or password." }
  }

  await createSession(user.id)
  redirect("/")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}

const SetupSchema = z
  .object({
    fullName: z.string().trim().min(1, { error: "Enter your name." }),
    email: z.email({ error: "Enter a valid email." }).trim(),
    password: z
      .string()
      .min(8, { error: "Use at least 8 characters." }),
    confirmPassword: z.string().min(1, { error: "Confirm your password." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match.",
    path: ["confirmPassword"],
  })

export type SetupState =
  | {
      errors?: {
        fullName?: string[]
        email?: string[]
        password?: string[]
        confirmPassword?: string[]
      }
      formError?: string
    }
  | undefined

// First-run only: creates the initial admin account. Guards against being
// replayed after setup is done by re-checking user count itself, rather
// than trusting only the redirect on the /setup page.
export async function createFirstAdmin(
  _state: SetupState,
  formData: FormData
): Promise<SetupState> {
  const existingUserCount = await prisma.user.count()
  if (existingUserCount > 0) {
    redirect("/login")
  }

  const validated = SetupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors }
  }

  const { fullName, email, password } = validated.data
  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { fullName, email, passwordHash, role: "admin" },
  })

  await createSession(user.id)
  redirect("/")
}
