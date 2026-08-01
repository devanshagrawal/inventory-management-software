"use server"

import { revalidatePath } from "next/cache"
import * as z from "zod"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth/dal"

const ClientSchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }),
  address: z.string().trim().optional(),
  contactNo: z.string().trim().optional(),
  contactEmail: z
    .union([z.email({ error: "Enter a valid email." }), z.literal("")])
    .optional(),
})

export type ClientState =
  | {
      ok: true
    }
  | {
      ok: false
      errors?: {
        name?: string[]
        address?: string[]
        contactNo?: string[]
        contactEmail?: string[]
      }
      formError?: string
    }
  | undefined

function parseClientForm(formData: FormData) {
  return ClientSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    contactNo: formData.get("contactNo"),
    contactEmail: formData.get("contactEmail"),
  })
}

export async function createClient(
  _state: ClientState,
  formData: FormData
): Promise<ClientState> {
  const user = await requireAdmin()
  const validated = parseClientForm(formData)
  if (!validated.success) {
    return { ok: false, errors: z.flattenError(validated.error).fieldErrors }
  }

  const { name, address, contactNo, contactEmail } = validated.data
  await prisma.client.create({
    data: {
      name,
      address: address || null,
      contactNo: contactNo || null,
      contactEmail: contactEmail || null,
      createdById: user.id,
    },
  })

  revalidatePath("/clients")
  return { ok: true }
}

export async function updateClient(
  id: string,
  _state: ClientState,
  formData: FormData
): Promise<ClientState> {
  await requireAdmin()
  const validated = parseClientForm(formData)
  if (!validated.success) {
    return { ok: false, errors: z.flattenError(validated.error).fieldErrors }
  }

  const { name, address, contactNo, contactEmail } = validated.data
  await prisma.client.update({
    where: { id },
    data: {
      name,
      address: address || null,
      contactNo: contactNo || null,
      contactEmail: contactEmail || null,
    },
  })

  revalidatePath("/clients")
  return { ok: true }
}

export async function deleteClient(id: string) {
  await requireAdmin()
  try {
    await prisma.client.delete({ where: { id } })
  } catch {
    throw new Error(
      "Can't delete a client that has sales history. Remove their sales first."
    )
  }
  revalidatePath("/clients")
}
