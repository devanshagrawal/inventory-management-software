"use client"

import { useState } from "react"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatPaise, rupeesToPaise } from "@/lib/money"

type SkuOption = {
  id: string
  companyName: string
  modelName: string
  stockQty?: number
}

type Row = {
  key: string
  skuId: string
  quantity: string
  pricePerItem: string
}

let rowKeySeq = 0
function newRow(): Row {
  rowKeySeq += 1
  return {
    key: `row-${rowKeySeq}`,
    skuId: "",
    quantity: "",
    pricePerItem: "",
  }
}

// Line items are shared UI between the purchase and sale forms: a dynamic
// list of {SKU, quantity, price} rows serialized into a hidden JSON field,
// since there's no clean native FormData shape for a dynamic row array.
export function LineItemsEditor({
  name,
  skus,
  showStock = false,
}: {
  name: string
  skus: SkuOption[]
  showStock?: boolean
}) {
  const [rows, setRows] = useState<Row[]>([newRow()])

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r))
    )
  }

  function addRow() {
    setRows((prev) => [...prev, newRow()])
  }

  function removeRow(key: string) {
    setRows((prev) =>
      prev.length === 1 ? prev : prev.filter((r) => r.key !== key)
    )
  }

  const usableRows = rows.filter((r) => r.skuId)
  const serialized = JSON.stringify(
    usableRows.map((r) => ({
      skuId: r.skuId,
      quantity: r.quantity,
      pricePerItem: r.pricePerItem,
    }))
  )

  const grandTotal = usableRows.reduce((sum, r) => {
    const qty = Number(r.quantity)
    const price = Number(r.pricePerItem)
    if (!qty || !price || qty <= 0 || price <= 0) return sum
    return sum + rupeesToPaise(price) * qty
  }, 0)

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={serialized} readOnly />
      <div className="flex flex-col gap-3">
        {rows.map((row) => {
          const sku = skus.find((s) => s.id === row.skuId)
          return (
            <div key={row.key} className="flex items-start gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <Select
                  value={row.skuId}
                  onValueChange={(value) =>
                    updateRow(row.key, { skuId: value ?? "" })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an item">
                      {() =>
                        sku
                          ? `${sku.companyName} — ${sku.modelName}`
                          : "Select an item"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {skus.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.companyName} — {s.modelName}
                        {showStock ? ` (${s.stockQty} in stock)` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showStock && sku && (
                  <p className="text-muted-foreground text-xs">
                    {sku.stockQty} currently in stock
                  </p>
                )}
              </div>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="Qty"
                className="w-20"
                value={row.quantity}
                required={!!row.skuId}
                onChange={(e) =>
                  updateRow(row.key, { quantity: e.target.value })
                }
              />
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Price/item (₹)"
                className="w-32"
                value={row.pricePerItem}
                required={!!row.skuId}
                onChange={(e) =>
                  updateRow(row.key, { pricePerItem: e.target.value })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeRow(row.key)}
                disabled={rows.length === 1}
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          )
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
        className="w-fit"
      >
        Add item
      </Button>
      {grandTotal > 0 && (
        <p className="text-sm">
          Grand total:{" "}
          <span className="font-medium">{formatPaise(grandTotal)}</span>
        </p>
      )}
    </div>
  )
}
