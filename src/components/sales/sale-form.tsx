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
import { createSale, type SaleState } from "@/lib/sales/actions"
import { LineItemsEditor } from "@/components/line-items-editor"

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
  const today = new Date().toISOString().slice(0, 10)

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="clientId">Client</Label>
        <Select
          name="clientId"
          value={clientId}
          onValueChange={(value) => setClientId(value ?? "")}
        >
          <SelectTrigger id="clientId" className="w-full max-w-sm">
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
        <Label htmlFor="saleDate">Sale date</Label>
        <Input
          id="saleDate"
          name="saleDate"
          type="date"
          defaultValue={today}
          className="max-w-sm"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Items</Label>
        <LineItemsEditor name="items" skus={skus} showStock />
      </div>

      {state?.ok === false && state.formError && (
        <p className="text-destructive text-sm">{state.formError}</p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 w-fit">
        {pending ? "Saving..." : "Add sale"}
      </Button>
    </form>
  )
}
