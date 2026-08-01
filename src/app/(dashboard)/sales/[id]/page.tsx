import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { requireUser } from "@/lib/auth/dal"
import { formatPaise } from "@/lib/money"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SaleDeleteButton } from "@/components/sales/sale-delete-button"
import { PaymentsList } from "@/components/sales/payments-list"
import { PaymentForm } from "@/components/sales/payment-form"

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireUser()

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      client: true,
      sku: true,
      payments: { orderBy: { paymentDate: "desc" } },
    },
  })

  if (!sale) {
    notFound()
  }

  const total = sale.pricePerItemPaise * sale.quantity
  const paid = sale.payments.reduce((sum, p) => sum + p.amountPaise, 0)
  const balance = total - paid

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/sales"
            className="text-muted-foreground text-sm underline underline-offset-2"
          >
            ← Sales
          </Link>
          <h1 className="text-2xl font-semibold">Sale detail</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            render={
              <a
                href={`/api/pdf/sales/${sale.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download PDF
              </a>
            }
          />
          {user.role === "admin" && <SaleDeleteButton id={sale.id} />}
        </div>
      </div>

      <div className="grid max-w-2xl grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Client
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <p className="font-medium">{sale.client.name}</p>
            {sale.client.address && (
              <p className="text-muted-foreground text-sm">
                {sale.client.address}
              </p>
            )}
            {sale.client.contactNo && (
              <p className="text-muted-foreground text-sm">
                {sale.client.contactNo}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Item
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <p className="font-medium">
              {sale.sku.companyName} — {sale.sku.modelName}
            </p>
            <p className="text-muted-foreground text-sm">
              Qty {sale.quantity} × {formatPaise(sale.pricePerItemPaise)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p>Date: {sale.saleDate.toLocaleDateString("en-IN")}</p>
          <p className="text-lg font-semibold">Total: {formatPaise(total)}</p>
          <p>Paid: {formatPaise(paid)}</p>
          <div className="flex items-center gap-2">
            <span>Balance due:</span>
            <Badge variant={balance > 0 ? "destructive" : "secondary"}>
              {formatPaise(balance)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <PaymentsList payments={sale.payments} />
          {balance > 0 && <PaymentForm saleId={sale.id} />}
        </CardContent>
      </Card>
    </div>
  )
}
