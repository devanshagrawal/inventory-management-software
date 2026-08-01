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
import { createSale, type SaleState } from "@/lib/sales/actions"
import { formatPaise, rupeesToPaise } from "@/lib/money"

type Client = { id: string; name: string }
type Sku = { id: string; companyName: string; modelName: string; stockQty: number }

export function SaleForm({
  clients,
  skus,
}: {
  clients: Client[]
  skus: Sku[]
}) {
  const [state, formAction, pending] = useActionState<SaleState, FormData>(
    createSale,
    undefined
  )

  const [clientId, setClientId] = useState("")
  const [skuId, setSkuId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [pricePerItem, setPricePerItem] = useState("")

  const selectedSku = skus.find((s) => s.id === skuId)

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
        <Label htmlFor="clientId">Client</Label>
        <Select
          name="clientId"
          value={clientId}
          onValueChange={(value) => setClientId(value ?? "")}
        >
          <SelectTrigger id="clientId" className="w-full">
            <SelectValue placeholder="Select a client">
              {(value: string | null) =>
                clients.find((c) => c.id === value)?.name ?? "Select a client"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.ok === false && state.errors?.clientId && (
          <p className="text-destructive text-sm">
            {state.errors.clientId[0]}
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
                {sku.companyName} — {sku.modelName} ({sku.stockQty} in stock)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedSku && (
          <p className="text-muted-foreground text-sm">
            {selectedSku.stockQty} currently in stock
          </p>
        )}
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
        <Label htmlFor="saleDate">Sale date</Label>
        <Input
          id="saleDate"
          name="saleDate"
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
        {pending ? "Saving..." : "Add sale"}
      </Button>
    </form>
  )
}
