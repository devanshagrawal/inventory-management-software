import { prisma } from "@/lib/db"
import { requireUser } from "@/lib/auth/dal"
import { Button } from "@/components/ui/button"
import { ClientFormDialog } from "@/components/clients/client-form-dialog"
import { ClientsTable } from "@/components/clients/clients-table"

export default async function ClientsPage() {
  const user = await requireUser()
  const isAdmin = user.role === "admin"
  const clients = await prisma.client.findMany({
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
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-muted-foreground text-sm">
            Customers you sell inventory to.
          </p>
        </div>
        {isAdmin && (
          <ClientFormDialog trigger={<Button>Add client</Button>} />
        )}
      </div>
      <ClientsTable clients={clients} isAdmin={isAdmin} />
    </div>
  )
}
