import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { requireUser } from "@/lib/auth/dal"
import { formatPaise } from "@/lib/money"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function ClientReceivablesPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  await requireUser()

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      sales: {
        orderBy: { saleDate: "desc" },
        include: {
          sku: { select: { companyName: true, modelName: true } },
          payments: { select: { amountPaise: true } },
        },
      },
    },
  })

  if (!client) {
    notFound()
  }

  const rows = client.sales.map((sale) => {
    const total = sale.pricePerItemPaise * sale.quantity
    const paid = sale.payments.reduce((sum, p) => sum + p.amountPaise, 0)
    return { ...sale, total, paid, balance: total - paid }
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/receivables"
          className="text-muted-foreground text-sm underline underline-offset-2"
        >
          ← Receivables
        </Link>
        <h1 className="text-2xl font-semibold">{client.name}</h1>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No sales bills for this client yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="w-1">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.saleDate.toLocaleDateString("en-IN")}</TableCell>
                <TableCell>
                  {row.sku.companyName} — {row.sku.modelName}
                </TableCell>
                <TableCell>{formatPaise(row.total)}</TableCell>
                <TableCell>{formatPaise(row.paid)}</TableCell>
                <TableCell>
                  <Badge variant={row.balance > 0 ? "destructive" : "secondary"}>
                    {formatPaise(row.balance)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/sales/${row.id}`}
                    className="text-sm underline underline-offset-2"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
