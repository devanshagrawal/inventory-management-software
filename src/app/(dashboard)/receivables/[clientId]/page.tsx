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
import { StatTile } from "@/components/stat-tile"
import { ClientPaymentDialog } from "@/components/receivables/client-payment-dialog"

type LedgerEntry = {
  date: Date
  sortKey: Date
  description: string
  debit: number
  credit: number
  href: string | null
}

export default async function ClientLedgerPage({
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
        include: {
          items: { select: { quantity: true, pricePerItemPaise: true } },
        },
      },
      payments: true,
    },
  })

  if (!client) {
    notFound()
  }

  const entries: LedgerEntry[] = []

  for (const sale of client.sales) {
    const total = sale.items.reduce(
      (sum, i) => sum + i.pricePerItemPaise * i.quantity,
      0
    )
    const itemCount = sale.items.length
    entries.push({
      date: sale.saleDate,
      sortKey: sale.createdAt,
      description: `Sale — ${itemCount} item${itemCount === 1 ? "" : "s"}`,
      debit: total,
      credit: 0,
      href: `/sales/${sale.id}`,
    })
  }

  for (const payment of client.payments) {
    entries.push({
      date: payment.paymentDate,
      sortKey: payment.createdAt,
      description: payment.method
        ? `Payment received (${payment.method})`
        : "Payment received",
      debit: 0,
      credit: payment.amountPaise,
      href: payment.saleId ? `/sales/${payment.saleId}` : null,
    })
  }

  entries.sort(
    (a, b) =>
      a.date.getTime() - b.date.getTime() ||
      a.sortKey.getTime() - b.sortKey.getTime()
  )

  let running = 0
  const rows = entries.map((entry) => {
    running += entry.debit - entry.credit
    return { ...entry, balance: running }
  })

  const closingBalance = running

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/receivables"
            className="text-muted-foreground text-sm underline underline-offset-2"
          >
            ← Receivables
          </Link>
          <h1 className="text-2xl font-semibold">{client.name} — Ledger</h1>
          <p className="text-muted-foreground text-sm">
            Chronological record of sales (debit) and payments (credit) for
            this client.
          </p>
        </div>
        <ClientPaymentDialog clientId={client.id} />
      </div>

      <StatTile
        label="Closing balance"
        value={formatPaise(closingBalance)}
        tone={closingBalance > 0 ? "bad" : "good"}
        className="w-fit min-w-56"
      />

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No sales or payments for this client yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono text-sm tabular-nums">
                  {row.date.toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell>
                  {row.href ? (
                    <Link
                      href={row.href}
                      className="underline underline-offset-2"
                    >
                      {row.description}
                    </Link>
                  ) : (
                    row.description
                  )}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {row.debit > 0 ? formatPaise(row.debit) : "—"}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {row.credit > 0 ? formatPaise(row.credit) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={row.balance > 0 ? "destructive" : "success"}
                    className="font-mono tabular-nums"
                  >
                    {formatPaise(row.balance)}
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
