import Link from "next/link"
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

export default async function ReceivablesPage() {
  await requireUser()

  const sales = await prisma.sale.findMany({
    select: {
      id: true,
      items: { select: { quantity: true, pricePerItemPaise: true } },
      client: { select: { id: true, name: true } },
      payments: { select: { amountPaise: true } },
    },
  })

  const byClient = new Map<
    string,
    { name: string; billed: number; paid: number }
  >()

  for (const sale of sales) {
    const total = sale.items.reduce(
      (sum, i) => sum + i.pricePerItemPaise * i.quantity,
      0
    )
    const paid = sale.payments.reduce((sum, p) => sum + p.amountPaise, 0)
    const existing = byClient.get(sale.client.id)
    if (existing) {
      existing.billed += total
      existing.paid += paid
    } else {
      byClient.set(sale.client.id, {
        name: sale.client.name,
        billed: total,
        paid,
      })
    }
  }

  const rows = Array.from(byClient.entries())
    .map(([clientId, data]) => ({
      clientId,
      ...data,
      outstanding: data.billed - data.paid,
    }))
    .sort((a, b) => b.outstanding - a.outstanding)

  const totalOutstanding = rows.reduce((sum, r) => sum + r.outstanding, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Receivables</h1>
        <p className="text-muted-foreground text-sm">
          Outstanding balance per client. Click a client for their full
          ledger.
        </p>
      </div>

      <p className="text-lg font-semibold">
        Total outstanding: {formatPaise(totalOutstanding)}
      </p>

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">No sales recorded yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Billed</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Outstanding</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.clientId}>
                <TableCell className="font-medium">
                  <Link
                    href={`/receivables/${row.clientId}`}
                    className="underline underline-offset-2"
                  >
                    {row.name}
                  </Link>
                </TableCell>
                <TableCell>{formatPaise(row.billed)}</TableCell>
                <TableCell>{formatPaise(row.paid)}</TableCell>
                <TableCell>
                  <Badge
                    variant={row.outstanding > 0 ? "destructive" : "secondary"}
                  >
                    {formatPaise(row.outstanding)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
