"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { createSku, updateSku, type SkuState } from "@/lib/skus/actions"

type Sku = {
  id: string
  companyName: string
  modelName: string
  modelDescription: string | null
}

export function SkuFormDialog({
  sku,
  trigger,
}: {
  sku?: Sku
  trigger: React.ReactElement
}) {
  const isEdit = !!sku
  const action = isEdit ? updateSku.bind(null, sku.id) : createSku
  const [state, formAction, pending] = useActionState<SkuState, FormData>(
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
      toast.success(isEdit ? "SKU updated." : "SKU added.")
    }
  }, [state, isEdit])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit SKU" : "Add SKU"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName"
              name="companyName"
              defaultValue={sku?.companyName}
              required
            />
            {state?.ok === false && state.errors?.companyName && (
              <p className="text-destructive text-sm">
                {state.errors.companyName[0]}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="modelName">Model name</Label>
            <Input
              id="modelName"
              name="modelName"
              defaultValue={sku?.modelName}
              required
            />
            {state?.ok === false && state.errors?.modelName && (
              <p className="text-destructive text-sm">
                {state.errors.modelName[0]}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="modelDescription">Description</Label>
            <Textarea
              id="modelDescription"
              name="modelDescription"
              defaultValue={sku?.modelDescription ?? ""}
            />
          </div>
          {state?.ok === false && state.formError && (
            <p className="text-destructive text-sm">{state.formError}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Save changes" : "Add SKU"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
