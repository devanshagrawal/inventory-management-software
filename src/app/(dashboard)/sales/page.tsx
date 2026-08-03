import Link from "next/link"
import { prisma } from "@/lib/db"
import { requireUser } from "@/lib/auth/dal"
import { Button } from "@/components/ui/button"
import { SalesTable } from "@/components/sales/sales-table"

export default async function SalesPage() {
  const user = await requireUser()
  const isAdmin = user.role === "admin"
  const sales = await prisma.sale.findMany({
    orderBy: { saleDate: "desc" },
    select: {
      id: true,
      saleDate: true,
      client: { select: { name: true } },
      items: {
        select: {
          quantity: true,
          pricePerItemPaise: true,
          sku: { select: { companyName: true, modelName: true } },
        },
      },
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sales</h1>
          <p className="text-muted-foreground text-sm">
            Inventory sold to clients.
          </p>
        </div>
        <Button render={<Link href="/sales/new">New sale</Link>} />
      </div>
      <SalesTable sales={sales} isAdmin={isAdmin} />
    </div>
  )
}
