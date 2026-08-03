"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import * as z from "zod"
import { prisma, getSqliteTriggerMessage } from "@/lib/db"
import { requireUser, requireAdmin } from "@/lib/auth/dal"
import { rupeesToPaise } from "@/lib/money"
import { parseLineItems } from "@/lib/line-items"

const SaleHeaderSchema = z.object({
  clientId: z.string().trim().min(1, { error: "Select a client." }),
  saleDate: z.string().trim().min(1, { error: "Pick a date." }),
})

export type SaleState =
  | {
      ok: false
      errors?: {
        clientId?: string[]
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

  const validated = SaleHeaderSchema.safeParse({
    clientId: formData.get("clientId"),
    saleDate: formData.get("saleDate"),
  })

  if (!validated.success) {
    return { ok: false, errors: z.flattenError(validated.error).fieldErrors }
  }

  const items = parseLineItems(formData.get("items"))
  if (!items.success) {
    return { ok: false, formError: items.error }
  }

  const { clientId, saleDate } = validated.data

  try {
    await prisma.sale.create({
      data: {
        clientId,
        saleDate: new Date(saleDate),
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
  } catch (err) {
    const triggerMessage = getSqliteTriggerMessage(err)
    if (triggerMessage?.includes("Insufficient stock")) {
      return {
        ok: false,
        formError:
          "Not enough stock for one of the items to complete this sale. Nothing was saved.",
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
