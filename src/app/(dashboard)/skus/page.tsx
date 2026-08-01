import { prisma } from "@/lib/db"
import { requireUser } from "@/lib/auth/dal"
import { Button } from "@/components/ui/button"
import { SkuFormDialog } from "@/components/skus/sku-form-dialog"
import { SkusTable } from "@/components/skus/skus-table"

export default async function SkusPage() {
  const user = await requireUser()
  const isAdmin = user.role === "admin"
  const skus = await prisma.sku.findMany({
    orderBy: [{ companyName: "asc" }, { modelName: "asc" }],
    select: {
      id: true,
      companyName: true,
      modelName: true,
      modelDescription: true,
      stockQty: true,
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">SKUs</h1>
          <p className="text-muted-foreground text-sm">
            Product catalog and current stock levels.
          </p>
        </div>
        {isAdmin && <SkuFormDialog trigger={<Button>Add SKU</Button>} />}
      </div>
      <SkusTable skus={skus} isAdmin={isAdmin} />
    </div>
  )
}
