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
  quantity: number
  pricePerItemPaise: number
  purchaseDate: Date
  vendor: { name: string }
  sku: { companyName: string; modelName: string }
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
          <TableHead>Item</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Price/item</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="w-1">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchases.map((purchase) => (
          <TableRow key={purchase.id}>
            <TableCell>
              {purchase.purchaseDate.toLocaleDateString("en-IN")}
            </TableCell>
            <TableCell className="font-medium">
              {purchase.vendor.name}
            </TableCell>
            <TableCell>
              {purchase.sku.companyName} — {purchase.sku.modelName}
            </TableCell>
            <TableCell>{purchase.quantity}</TableCell>
            <TableCell>{formatPaise(purchase.pricePerItemPaise)}</TableCell>
            <TableCell>
              {formatPaise(purchase.pricePerItemPaise * purchase.quantity)}
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
