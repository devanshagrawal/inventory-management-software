"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import * as z from "zod"
import { prisma } from "@/lib/db"
import { requireUser, requireAdmin } from "@/lib/auth/dal"
import { rupeesToPaise } from "@/lib/money"

const PurchaseSchema = z.object({
  vendorId: z.string().trim().min(1, { error: "Select a vendor." }),
  skuId: z.string().trim().min(1, { error: "Select an item." }),
  quantity: z.coerce
    .number({ error: "Enter a quantity." })
    .int({ error: "Quantity must be a whole number." })
    .positive({ error: "Quantity must be greater than 0." }),
  pricePerItem: z.coerce
    .number({ error: "Enter a price." })
    .positive({ error: "Price must be greater than 0." }),
  purchaseDate: z.string().trim().min(1, { error: "Pick a date." }),
})

export type PurchaseState =
  | {
      ok: false
      errors?: {
        vendorId?: string[]
        skuId?: string[]
        quantity?: string[]
        pricePerItem?: string[]
        purchaseDate?: string[]
      }
      formError?: string
    }
  | undefined

export async function createPurchase(
  _state: PurchaseState,
  formData: FormData
): Promise<PurchaseState> {
  const user = await requireUser()

  const validated = PurchaseSchema.safeParse({
    vendorId: formData.get("vendorId"),
    skuId: formData.get("skuId"),
    quantity: formData.get("quantity"),
    pricePerItem: formData.get("pricePerItem"),
    purchaseDate: formData.get("purchaseDate"),
  })

  if (!validated.success) {
    return { ok: false, errors: z.flattenError(validated.error).fieldErrors }
  }

  const { vendorId, skuId, quantity, pricePerItem, purchaseDate } =
    validated.data

  await prisma.purchase.create({
    data: {
      vendorId,
      skuId,
      quantity,
      pricePerItemPaise: rupeesToPaise(pricePerItem),
      purchaseDate: new Date(purchaseDate),
      createdById: user.id,
    },
  })

  revalidatePath("/purchases")
  revalidatePath("/skus")
  revalidatePath("/")
  redirect("/purchases")
}

export async function deletePurchase(id: string) {
  await requireAdmin()
  await prisma.purchase.delete({ where: { id } })
  revalidatePath("/purchases")
  revalidatePath("/skus")
  revalidatePath("/")
}
