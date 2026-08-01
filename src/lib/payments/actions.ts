"use server"

import { revalidatePath } from "next/cache"
import * as z from "zod"
import { prisma } from "@/lib/db"
import { requireUser } from "@/lib/auth/dal"
import { rupeesToPaise } from "@/lib/money"

const PaymentSchema = z.object({
  saleId: z.string().trim().min(1),
  amount: z.coerce
    .number({ error: "Enter an amount." })
    .positive({ error: "Amount must be greater than 0." }),
  paymentDate: z.string().trim().min(1, { error: "Pick a date." }),
  method: z.string().trim().optional(),
  notes: z.string().trim().optional(),
})

export type PaymentState =
  | {
      ok: true
    }
  | {
      ok: false
      errors?: {
        amount?: string[]
        paymentDate?: string[]
      }
      formError?: string
    }
  | undefined

export async function createPayment(
  saleId: string,
  _state: PaymentState,
  formData: FormData
): Promise<PaymentState> {
  const user = await requireUser()

  const validated = PaymentSchema.safeParse({
    saleId,
    amount: formData.get("amount"),
    paymentDate: formData.get("paymentDate"),
    method: formData.get("method"),
    notes: formData.get("notes"),
  })

  if (!validated.success) {
    return { ok: false, errors: z.flattenError(validated.error).fieldErrors }
  }

  const { amount, paymentDate, method, notes } = validated.data

  await prisma.payment.create({
    data: {
      saleId,
      amountPaise: rupeesToPaise(amount),
      paymentDate: new Date(paymentDate),
      method: method || null,
      notes: notes || null,
      createdById: user.id,
    },
  })

  revalidatePath(`/sales/${saleId}`)
  revalidatePath("/receivables")
  revalidatePath("/")
  return { ok: true }
}
