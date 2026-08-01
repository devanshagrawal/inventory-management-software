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
