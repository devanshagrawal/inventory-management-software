import { prisma } from "@/lib/db"
import { requireUser } from "@/lib/auth/dal"
import { Button } from "@/components/ui/button"
import { VendorFormDialog } from "@/components/vendors/vendor-form-dialog"
import { VendorsTable } from "@/components/vendors/vendors-table"

export default async function VendorsPage() {
  const user = await requireUser()
  const isAdmin = user.role === "admin"
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      address: true,
      contactNo: true,
      contactEmail: true,
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Vendors</h1>
          <p className="text-muted-foreground text-sm">
            Suppliers you purchase inventory from.
          </p>
        </div>
        {isAdmin && (
          <VendorFormDialog trigger={<Button>Add vendor</Button>} />
        )}
      </div>
      <VendorsTable vendors={vendors} isAdmin={isAdmin} />
    </div>
  )
}
