import { logout } from "@/lib/auth/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Role } from "@/lib/roles"

export function UserMenu({
  email,
  role,
}: {
  email: string
  role: Role
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-sm font-medium">{email}</span>
        <Badge variant="secondary" className="w-fit capitalize">
          {role}
        </Badge>
      </div>
      <form action={logout}>
        <Button type="submit" variant="ghost" size="sm">
          Sign out
        </Button>
      </form>
    </div>
  )
}
