"use client"

import { useActionState, useMemo, useState } from "react"
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
import { formatPaise, rupeesToPaise } from "@/lib/money"

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
  const [skuId, setSkuId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [pricePerItem, setPricePerItem] = useState("")

  const total = useMemo(() => {
    const qty = Number(quantity)
    const price = Number(pricePerItem)
    if (!qty || !price || qty <= 0 || price <= 0) return null
    return formatPaise(rupeesToPaise(price) * qty)
  }, [quantity, pricePerItem])

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="vendorId">Vendor</Label>
        <Select
          name="vendorId"
          value={vendorId}
          onValueChange={(value) => setVendorId(value ?? "")}
        >
          <SelectTrigger id="vendorId" className="w-full">
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
        <Label htmlFor="skuId">Item</Label>
        <Select
          name="skuId"
          value={skuId}
          onValueChange={(value) => setSkuId(value ?? "")}
        >
          <SelectTrigger id="skuId" className="w-full">
            <SelectValue placeholder="Select an item">
              {(value: string | null) => {
                const sku = skus.find((s) => s.id === value)
                return sku
                  ? `${sku.companyName} — ${sku.modelName}`
                  : "Select an item"
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {skus.map((sku) => (
              <SelectItem key={sku.id} value={sku.id}>
                {sku.companyName} — {sku.modelName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.ok === false && state.errors?.skuId && (
          <p className="text-destructive text-sm">{state.errors.skuId[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        {state?.ok === false && state.errors?.quantity && (
          <p className="text-destructive text-sm">
            {state.errors.quantity[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pricePerItem">Price per item (₹)</Label>
        <Input
          id="pricePerItem"
          name="pricePerItem"
          type="number"
          min="0"
          step="0.01"
          value={pricePerItem}
          onChange={(e) => setPricePerItem(e.target.value)}
          required
        />
        {state?.ok === false && state.errors?.pricePerItem && (
          <p className="text-destructive text-sm">
            {state.errors.pricePerItem[0]}
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
          required
        />
      </div>

      {total && (
        <p className="text-sm">
          Total: <span className="font-medium">{total}</span>
        </p>
      )}

      {state?.ok === false && state.formError && (
        <p className="text-destructive text-sm">{state.formError}</p>
      )}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Saving..." : "Add purchase"}
      </Button>
    </form>
  )
}
