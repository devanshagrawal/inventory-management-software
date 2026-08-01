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
import { SaleDeleteButton } from "@/components/sales/sale-delete-button"

type Sale = {
  id: string
  quantity: number
  pricePerItemPaise: number
  saleDate: Date
  client: { name: string }
  sku: { companyName: string; modelName: string }
}

export function SalesTable({
  sales,
  isAdmin,
}: {
  sales: Sale[]
  isAdmin: boolean
}) {
  if (sales.length === 0) {
    return <p className="text-muted-foreground text-sm">No sales yet.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Price/item</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="w-1">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale) => (
          <TableRow key={sale.id}>
            <TableCell>{sale.saleDate.toLocaleDateString("en-IN")}</TableCell>
            <TableCell className="font-medium">{sale.client.name}</TableCell>
            <TableCell>
              {sale.sku.companyName} — {sale.sku.modelName}
            </TableCell>
            <TableCell>{sale.quantity}</TableCell>
            <TableCell>{formatPaise(sale.pricePerItemPaise)}</TableCell>
            <TableCell>
              {formatPaise(sale.pricePerItemPaise * sale.quantity)}
            </TableCell>
            <TableCell className="flex gap-1">
              <Link
                href={`/sales/${sale.id}`}
                className="text-sm underline underline-offset-2"
              >
                View
              </Link>
              {isAdmin && <SaleDeleteButton id={sale.id} />}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
