"use server"

import { revalidatePath } from "next/cache"
import * as z from "zod"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth/dal"

const VendorSchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }),
  address: z.string().trim().optional(),
  contactNo: z.string().trim().optional(),
  contactEmail: z
    .union([z.email({ error: "Enter a valid email." }), z.literal("")])
    .optional(),
})

export type VendorState =
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

function parseVendorForm(formData: FormData) {
  return VendorSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    contactNo: formData.get("contactNo"),
    contactEmail: formData.get("contactEmail"),
  })
}

export async function createVendor(
  _state: VendorState,
  formData: FormData
): Promise<VendorState> {
  const user = await requireAdmin()
  const validated = parseVendorForm(formData)
  if (!validated.success) {
    return { ok: false, errors: z.flattenError(validated.error).fieldErrors }
  }

  const { name, address, contactNo, contactEmail } = validated.data
  await prisma.vendor.create({
    data: {
      name,
      address: address || null,
      contactNo: contactNo || null,
      contactEmail: contactEmail || null,
      createdById: user.id,
    },
  })

  revalidatePath("/vendors")
  return { ok: true }
}

export async function updateVendor(
  id: string,
  _state: VendorState,
  formData: FormData
): Promise<VendorState> {
  await requireAdmin()
  const validated = parseVendorForm(formData)
  if (!validated.success) {
    return { ok: false, errors: z.flattenError(validated.error).fieldErrors }
  }

  const { name, address, contactNo, contactEmail } = validated.data
  await prisma.vendor.update({
    where: { id },
    data: {
      name,
      address: address || null,
      contactNo: contactNo || null,
      contactEmail: contactEmail || null,
    },
  })

  revalidatePath("/vendors")
  return { ok: true }
}

export async function deleteVendor(id: string) {
  await requireAdmin()
  try {
    await prisma.vendor.delete({ where: { id } })
  } catch {
    throw new Error(
      "Can't delete a vendor that has purchase history. Remove their purchases first."
    )
  }
  revalidatePath("/vendors")
}
