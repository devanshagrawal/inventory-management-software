import { prisma } from "@/lib/db"
import { requireUser } from "@/lib/auth/dal"
import { PurchaseForm } from "@/components/purchases/purchase-form"

export default async function NewPurchasePage() {
  await requireUser()
  const [vendors, skus] = await Promise.all([
    prisma.vendor.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.sku.findMany({
      orderBy: [{ companyName: "asc" }, { modelName: "asc" }],
      select: { id: true, companyName: true, modelName: true },
    }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">New purchase</h1>
        <p className="text-muted-foreground text-sm">
          Record inventory bought from a vendor.
        </p>
      </div>
      {vendors.length === 0 || skus.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Add at least one vendor and one SKU before recording a purchase.
        </p>
      ) : (
        <PurchaseForm vendors={vendors} skus={skus} />
      )}
    </div>
  )
}
