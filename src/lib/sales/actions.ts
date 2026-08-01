"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import * as z from "zod"
import { prisma, getSqliteTriggerMessage } from "@/lib/db"
import { requireUser, requireAdmin } from "@/lib/auth/dal"
import { rupeesToPaise } from "@/lib/money"

const SaleSchema = z.object({
  clientId: z.string().trim().min(1, { error: "Select a client." }),
  skuId: z.string().trim().min(1, { error: "Select an item." }),
  quantity: z.coerce
    .number({ error: "Enter a quantity." })
    .int({ error: "Quantity must be a whole number." })
    .positive({ error: "Quantity must be greater than 0." }),
  pricePerItem: z.coerce
    .number({ error: "Enter a price." })
    .positive({ error: "Price must be greater than 0." }),
  saleDate: z.string().trim().min(1, { error: "Pick a date." }),
})

export type SaleState =
  | {
      ok: false
      errors?: {
        clientId?: string[]
        skuId?: string[]
        quantity?: string[]
        pricePerItem?: string[]
        saleDate?: string[]
      }
      formError?: string
    }
  | undefined

export async function createSale(
  _state: SaleState,
  formData: FormData
): Promise<SaleState> {
  const user = await requireUser()

  const validated = SaleSchema.safeParse({
    clientId: formData.get("clientId"),
    skuId: formData.get("skuId"),
    quantity: formData.get("quantity"),
    pricePerItem: formData.get("pricePerItem"),
    saleDate: formData.get("saleDate"),
  })

  if (!validated.success) {
    return { ok: false, errors: z.flattenError(validated.error).fieldErrors }
  }

  const { clientId, skuId, quantity, pricePerItem, saleDate } =
    validated.data

  try {
    await prisma.sale.create({
      data: {
        clientId,
        skuId,
        quantity,
        pricePerItemPaise: rupeesToPaise(pricePerItem),
        saleDate: new Date(saleDate),
        createdById: user.id,
      },
    })
  } catch (err) {
    const triggerMessage = getSqliteTriggerMessage(err)
    if (triggerMessage?.includes("Insufficient stock")) {
      return {
        ok: false,
        formError: "Not enough stock for this SKU to complete this sale.",
      }
    }
    return { ok: false, formError: "Failed to record sale." }
  }

  revalidatePath("/sales")
  revalidatePath("/skus")
  revalidatePath("/receivables")
  revalidatePath("/")
  redirect("/sales")
}

export async function deleteSale(id: string) {
  await requireAdmin()
  try {
    await prisma.sale.delete({ where: { id } })
  } catch {
    throw new Error(
      "Can't delete a sale that has payments recorded against it."
    )
  }
  revalidatePath("/sales")
  revalidatePath("/skus")
  revalidatePath("/receivables")
  revalidatePath("/")
}
