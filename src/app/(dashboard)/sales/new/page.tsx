import { prisma } from "@/lib/db"
import { requireUser } from "@/lib/auth/dal"
import { SaleForm } from "@/components/sales/sale-form"

export default async function NewSalePage() {
  await requireUser()
  const [clients, skus] = await Promise.all([
    prisma.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.sku.findMany({
      orderBy: [{ companyName: "asc" }, { modelName: "asc" }],
      select: { id: true, companyName: true, modelName: true, stockQty: true },
    }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">New sale</h1>
        <p className="text-muted-foreground text-sm">
          Record inventory sold to a client.
        </p>
      </div>
      {clients.length === 0 || skus.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Add at least one client and one SKU before recording a sale.
        </p>
      ) : (
        <SaleForm clients={clients} skus={skus} />
      )}
    </div>
  )
}
