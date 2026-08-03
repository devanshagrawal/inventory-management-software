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
  saleDate: Date
  client: { name: string }
  items: {
    quantity: number
    pricePerItemPaise: number
    sku: { companyName: string; modelName: string }
  }[]
}

function itemsSummary(items: Sale["items"]) {
  if (items.length === 0) return "—"
  const first = items[0]
  const label = `${first.sku.companyName} — ${first.sku.modelName}`
  return items.length > 1 ? `${label} +${items.length - 1} more` : label
}

function saleTotal(items: Sale["items"]) {
  return items.reduce((sum, i) => sum + i.pricePerItemPaise * i.quantity, 0)
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
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="w-1">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale) => (
          <TableRow key={sale.id}>
            <TableCell>{sale.saleDate.toLocaleDateString("en-IN")}</TableCell>
            <TableCell className="font-medium">{sale.client.name}</TableCell>
            <TableCell>{itemsSummary(sale.items)}</TableCell>
            <TableCell>{formatPaise(saleTotal(sale.items))}</TableCell>
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
