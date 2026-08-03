import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { prisma } from "@/lib/db"
import { formatPaise } from "@/lib/money"

export default async function DashboardPage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [skuCount, sales, salesThisMonth] = await Promise.all([
    prisma.sku.count(),
    prisma.sale.findMany({
      select: {
        items: { select: { quantity: true, pricePerItemPaise: true } },
        payments: { select: { amountPaise: true } },
      },
    }),
    prisma.sale.findMany({
      where: { saleDate: { gte: monthStart } },
      select: {
        items: { select: { quantity: true, pricePerItemPaise: true } },
      },
    }),
  ])

  function saleTotal(items: { quantity: number; pricePerItemPaise: number }[]) {
    return items.reduce((sum, i) => sum + i.pricePerItemPaise * i.quantity, 0)
  }

  const outstanding = sales.reduce((sum, sale) => {
    const total = saleTotal(sale.items)
    const paid = sale.payments.reduce((s, p) => s + p.amountPaise, 0)
    return sum + (total - paid)
  }, 0)

  const salesThisMonthTotal = salesThisMonth.reduce(
    (sum, sale) => sum + saleTotal(sale.items),
    0
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Overview of stock and receivables.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>SKUs in catalog</CardDescription>
            <CardTitle className="text-3xl">{skuCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Outstanding receivables</CardDescription>
            <CardTitle className="text-3xl">
              {formatPaise(outstanding)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Sales this month</CardDescription>
            <CardTitle className="text-3xl">
              {formatPaise(salesThisMonthTotal)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
