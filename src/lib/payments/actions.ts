"use server"

import { revalidatePath } from "next/cache"
import * as z from "zod"
import { prisma } from "@/lib/db"
import { requireUser } from "@/lib/auth/dal"
import { rupeesToPaise } from "@/lib/money"

const PaymentFieldsSchema = z.object({
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

// Records a payment against a specific sale. clientId is looked up from the
// sale rather than trusted from the caller, so a payment can never end up
// filed under a different client than the sale it's paying off.
export async function createSalePayment(
  saleId: string,
  _state: PaymentState,
  formData: FormData
): Promise<PaymentState> {
  const user = await requireUser()

  const validated = PaymentFieldsSchema.safeParse({
    amount: formData.get("amount"),
    paymentDate: formData.get("paymentDate"),
    method: formData.get("method"),
    notes: formData.get("notes"),
  })

  if (!validated.success) {
    return { ok: false, errors: z.flattenError(validated.error).fieldErrors }
  }

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    select: { clientId: true },
  })
  if (!sale) {
    return { ok: false, formError: "Sale not found." }
  }

  const { amount, paymentDate, method, notes } = validated.data

  await prisma.payment.create({
    data: {
      clientId: sale.clientId,
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
  revalidatePath(`/receivables/${sale.clientId}`)
  revalidatePath("/")
  return { ok: true }
}

// Records a payment against a client without allocating it to any one
// sale — e.g. the client is settling their running balance rather than a
// specific invoice.
export async function createClientPayment(
  clientId: string,
  _state: PaymentState,
  formData: FormData
): Promise<PaymentState> {
  const user = await requireUser()

  const validated = PaymentFieldsSchema.safeParse({
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
      clientId,
      amountPaise: rupeesToPaise(amount),
      paymentDate: new Date(paymentDate),
      method: method || null,
      notes: notes || null,
      createdById: user.id,
    },
  })

  revalidatePath(`/receivables/${clientId}`)
  revalidatePath("/receivables")
  revalidatePath("/")
  return { ok: true }
}
