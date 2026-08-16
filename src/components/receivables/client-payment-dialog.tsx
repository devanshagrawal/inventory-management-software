"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { createClientPayment, type PaymentState } from "@/lib/payments/actions"

export function ClientPaymentDialog({ clientId }: { clientId: string }) {
  const action = createClientPayment.bind(null, clientId)
  const [state, formAction, pending] = useActionState<PaymentState, FormData>(
    action,
    undefined
  )
  const [open, setOpen] = useState(false)
  const [announcedState, setAnnouncedState] = useState(state)

  if (state !== announcedState) {
    setAnnouncedState(state)
    if (state?.ok) {
      setOpen(false)
    }
  }

  useEffect(() => {
    if (state?.ok) {
      toast.success("Payment recorded.")
    }
  }, [state])

  const today = new Date().toISOString().slice(0, 10)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <span
              className="size-1.5 shrink-0 rounded-full bg-current opacity-80"
              aria-hidden="true"
            />
            Record payment
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            Records a payment against this client&apos;s running balance
            without tying it to a specific sale.
          </p>
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
            <Input
              id="method"
              name="method"
              placeholder="Cash, bank transfer..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input id="notes" name="notes" />
          </div>
          {state?.ok === false && state.formError && (
            <p className="text-destructive text-sm">{state.formError}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Record payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
