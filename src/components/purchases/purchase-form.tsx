"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createPurchase, type PurchaseState } from "@/lib/purchases/actions"
import { LineItemsEditor } from "@/components/line-items-editor"

type Vendor = { id: string; name: string }
type Sku = { id: string; companyName: string; modelName: string }

export function PurchaseForm({
  vendors,
  skus,
}: {
  vendors: Vendor[]
  skus: Sku[]
}) {
  const [state, formAction, pending] = useActionState<
    PurchaseState,
    FormData
  >(createPurchase, undefined)

  const [vendorId, setVendorId] = useState("")
  const today = new Date().toISOString().slice(0, 10)

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="vendorId">Vendor</Label>
        <Select
          name="vendorId"
          value={vendorId}
          onValueChange={(value) => setVendorId(value ?? "")}
        >
          <SelectTrigger id="vendorId" className="w-full max-w-sm">
            <SelectValue placeholder="Select a vendor">
              {(value: string | null) =>
                vendors.find((v) => v.id === value)?.name ??
                "Select a vendor"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {vendors.map((vendor) => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.ok === false && state.errors?.vendorId && (
          <p className="text-destructive text-sm">
            {state.errors.vendorId[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="purchaseDate">Purchase date</Label>
        <Input
          id="purchaseDate"
          name="purchaseDate"
          type="date"
          defaultValue={today}
          className="max-w-sm"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Items</Label>
        <LineItemsEditor name="items" skus={skus} />
      </div>

      {state?.ok === false && state.formError && (
        <p className="text-destructive text-sm">{state.formError}</p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 w-fit">
        {pending ? "Saving..." : "Add purchase"}
      </Button>
    </form>
  )
}
