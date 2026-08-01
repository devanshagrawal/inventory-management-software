"use server"

import { revalidatePath } from "next/cache"
import * as z from "zod"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth/dal"

const SkuSchema = z.object({
  companyName: z.string().trim().min(1, { error: "Company name is required." }),
  modelName: z.string().trim().min(1, { error: "Model name is required." }),
  modelDescription: z.string().trim().optional(),
})

export type SkuState =
  | {
      ok: true
    }
  | {
      ok: false
      errors?: {
        companyName?: string[]
        modelName?: string[]
        modelDescription?: string[]
      }
      formError?: string
    }
  | undefined

function parseSkuForm(formData: FormData) {
  return SkuSchema.safeParse({
    companyName: formData.get("companyName"),
    modelName: formData.get("modelName"),
    modelDescription: formData.get("modelDescription"),
  })
}

export async function createSku(
  _state: SkuState,
  formData: FormData
): Promise<SkuState> {
  const user = await requireAdmin()
  const validated = parseSkuForm(formData)
  if (!validated.success) {
    return { ok: false, errors: z.flattenError(validated.error).fieldErrors }
  }

  const { companyName, modelName, modelDescription } = validated.data
  await prisma.sku.create({
    data: {
      companyName,
      modelName,
      modelDescription: modelDescription || null,
      createdById: user.id,
    },
  })

  revalidatePath("/skus")
  return { ok: true }
}

export async function updateSku(
  id: string,
  _state: SkuState,
  formData: FormData
): Promise<SkuState> {
  await requireAdmin()
  const validated = parseSkuForm(formData)
  if (!validated.success) {
    return { ok: false, errors: z.flattenError(validated.error).fieldErrors }
  }

  const { companyName, modelName, modelDescription } = validated.data
  await prisma.sku.update({
    where: { id },
    data: {
      companyName,
      modelName,
      modelDescription: modelDescription || null,
    },
  })

  revalidatePath("/skus")
  return { ok: true }
}

export async function deleteSku(id: string) {
  await requireAdmin()
  try {
    await prisma.sku.delete({ where: { id } })
  } catch {
    throw new Error(
      "Can't delete a SKU that has purchase or sale history. Remove those first."
    )
  }
  revalidatePath("/skus")
}
