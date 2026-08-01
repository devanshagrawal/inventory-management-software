"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateUserRole } from "@/lib/users/actions"
import { ROLES, type Role } from "@/lib/roles"

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  staff: "Staff",
}

export function UserRoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string
  role: Role
  disabled?: boolean
}) {
  const [pending, startTransition] = useTransition()

  return (
    <Select
      value={role}
      disabled={disabled || pending}
      onValueChange={(value) => {
        if (!value || value === role) return
        startTransition(async () => {
          try {
            await updateUserRole(userId, value)
            toast.success("Role updated.")
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Failed to update role."
            )
          }
        })
      }}
    >
      <SelectTrigger size="sm" className="w-28">
        <SelectValue placeholder="Role">
          {(value: string | null) =>
            value ? ROLE_LABELS[value as Role] : "Role"
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {ROLE_LABELS[r]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
