import Link from "next/link"
import { prisma } from "@/lib/db"
import { requireUser } from "@/lib/auth/dal"
import { Button } from "@/components/ui/button"
import { PurchasesTable } from "@/components/purchases/purchases-table"

export default async function PurchasesPage() {
  const user = await requireUser()
  const isAdmin = user.role === "admin"
  const purchases = await prisma.purchase.findMany({
    orderBy: { purchaseDate: "desc" },
    select: {
      id: true,
      quantity: true,
      pricePerItemPaise: true,
      purchaseDate: true,
      vendor: { select: { name: true } },
      sku: { select: { companyName: true, modelName: true } },
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Purchases</h1>
          <p className="text-muted-foreground text-sm">
            Inventory bought from vendors.
          </p>
        </div>
        <Button render={<Link href="/purchases/new">New purchase</Link>} />
      </div>
      <PurchasesTable purchases={purchases} isAdmin={isAdmin} />
    </div>
  )
}
