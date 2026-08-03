"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import * as z from "zod"
import { prisma } from "@/lib/db"
import { requireUser, requireAdmin } from "@/lib/auth/dal"
import { rupeesToPaise } from "@/lib/money"
import { parseLineItems } from "@/lib/line-items"

const PurchaseHeaderSchema = z.object({
  vendorId: z.string().trim().min(1, { error: "Select a vendor." }),
  purchaseDate: z.string().trim().min(1, { error: "Pick a date." }),
})

export type PurchaseState =
  | {
      ok: false
      errors?: {
        vendorId?: string[]
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

  const validated = PurchaseHeaderSchema.safeParse({
    vendorId: formData.get("vendorId"),
    purchaseDate: formData.get("purchaseDate"),
  })

  if (!validated.success) {
    return { ok: false, errors: z.flattenError(validated.error).fieldErrors }
  }

  const items = parseLineItems(formData.get("items"))
  if (!items.success) {
    return { ok: false, formError: items.error }
  }

  const { vendorId, purchaseDate } = validated.data

  await prisma.purchase.create({
    data: {
      vendorId,
      purchaseDate: new Date(purchaseDate),
      createdById: user.id,
      items: {
        create: items.data.map((item) => ({
          skuId: item.skuId,
          quantity: item.quantity,
          pricePerItemPaise: rupeesToPaise(item.pricePerItem),
        })),
      },
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
