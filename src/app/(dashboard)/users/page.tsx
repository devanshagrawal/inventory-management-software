import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth/dal"
import { Button } from "@/components/ui/button"
import { UserFormDialog } from "@/components/users/user-form-dialog"
import { UsersTable } from "@/components/users/users-table"
import type { Role } from "@/lib/roles"

export default async function UsersPage() {
  const admin = await requireAdmin()
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-muted-foreground text-sm">
            Manage who can sign in and their role.
          </p>
        </div>
        <UserFormDialog trigger={<Button>Add user</Button>} />
      </div>
      <UsersTable
        users={users.map((u) => ({ ...u, role: u.role as Role }))}
        currentUserId={admin.id}
      />
    </div>
  )
}
