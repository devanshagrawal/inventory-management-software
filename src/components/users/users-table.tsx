import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserRoleSelect } from "@/components/users/user-role-select"
import { UserDeleteButton } from "@/components/users/user-delete-button"
import type { Role } from "@/lib/roles"

type User = {
  id: string
  email: string
  fullName: string | null
  role: Role
  createdAt: Date
}

export function UsersTable({
  users,
  currentUserId,
}: {
  users: User[]
  currentUserId: string
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="w-1">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isSelf = user.id === currentUserId
          return (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.email}
                {isSelf && (
                  <span className="text-muted-foreground"> (you)</span>
                )}
              </TableCell>
              <TableCell>{user.fullName || "—"}</TableCell>
              <TableCell>
                <UserRoleSelect
                  userId={user.id}
                  role={user.role}
                  disabled={isSelf}
                />
              </TableCell>
              <TableCell>
                {user.createdAt.toLocaleDateString("en-IN")}
              </TableCell>
              <TableCell>
                {!isSelf && (
                  <UserDeleteButton userId={user.id} email={user.email} />
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
