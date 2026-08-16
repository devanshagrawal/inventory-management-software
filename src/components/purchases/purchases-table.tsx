import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatPaise } from "@/lib/money"
import { PurchaseDeleteButton } from "@/components/purchases/purchase-delete-button"

type Purchase = {
  id: string
  purchaseDate: Date
  vendor: { name: string }
  items: {
    quantity: number
    pricePerItemPaise: number
    sku: { companyName: string; modelName: string }
  }[]
}

function itemsSummary(items: Purchase["items"]) {
  if (items.length === 0) return "—"
  const first = items[0]
  const label = `${first.sku.companyName} — ${first.sku.modelName}`
  return items.length > 1 ? `${label} +${items.length - 1} more` : label
}

function purchaseTotal(items: Purchase["items"]) {
  return items.reduce((sum, i) => sum + i.pricePerItemPaise * i.quantity, 0)
}

export function PurchasesTable({
  purchases,
  isAdmin,
}: {
  purchases: Purchase[]
  isAdmin: boolean
}) {
  if (purchases.length === 0) {
    return <p className="text-muted-foreground text-sm">No purchases yet.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Items</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="w-1">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchases.map((purchase) => (
          <TableRow key={purchase.id}>
            <TableCell className="font-mono text-sm tabular-nums">
              {purchase.purchaseDate.toLocaleDateString("en-IN")}
            </TableCell>
            <TableCell className="font-medium">
              {purchase.vendor.name}
            </TableCell>
            <TableCell>{itemsSummary(purchase.items)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {formatPaise(purchaseTotal(purchase.items))}
            </TableCell>
            <TableCell className="flex gap-1">
              <Link
                href={`/purchases/${purchase.id}`}
                className="text-sm underline underline-offset-2"
              >
                View
              </Link>
              {isAdmin && <PurchaseDeleteButton id={purchase.id} />}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
