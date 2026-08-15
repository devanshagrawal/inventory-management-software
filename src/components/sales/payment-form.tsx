"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSalePayment, type PaymentState } from "@/lib/payments/actions"

export function PaymentForm({ saleId }: { saleId: string }) {
  const action = createSalePayment.bind(null, saleId)
  const [state, formAction, pending] = useActionState<PaymentState, FormData>(
    action,
    undefined
  )

  const [announcedState, setAnnouncedState] = useState(state)
  const [resetKey, setResetKey] = useState(0)

  if (state !== announcedState) {
    setAnnouncedState(state)
    if (state?.ok) {
      setResetKey((k) => k + 1)
    }
  }

  useEffect(() => {
    if (state?.ok) {
      toast.success("Payment recorded.")
    }
  }, [state])

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form
      action={formAction}
      key={resetKey}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            required
          />
          {state?.ok === false && state.errors?.amount && (
            <p className="text-destructive text-sm">
              {state.errors.amount[0]}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="paymentDate">Date</Label>
          <Input
            id="paymentDate"
            name="paymentDate"
            type="date"
            defaultValue={today}
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="method">Method (optional)</Label>
        <Input id="method" name="method" placeholder="Cash, bank transfer..." />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input id="notes" name="notes" />
      </div>
      {state?.ok === false && state.formError && (
        <p className="text-destructive text-sm">{state.formError}</p>
      )}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Record payment"}
      </Button>
    </form>
  )
}
