"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { createUser, type CreateUserState } from "@/lib/users/actions"
import { ROLES, type Role } from "@/lib/roles"

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  staff: "Staff",
}

export function UserFormDialog({ trigger }: { trigger: React.ReactElement }) {
  const [state, formAction, pending] = useActionState<
    CreateUserState,
    FormData
  >(createUser, undefined)
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<Role>("staff")
  const [announcedState, setAnnouncedState] = useState(state)

  if (state !== announcedState) {
    setAnnouncedState(state)
    if (state?.ok) {
      setOpen(false)
      setRole("staff")
    }
  }

  useEffect(() => {
    if (state?.ok) {
      toast.success("User created.")
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
            {state?.ok === false && state.errors?.email && (
              <p className="text-destructive text-sm">
                {state.errors.email[0]}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">Full name (optional)</Label>
            <Input id="fullName" name="fullName" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Initial password</Label>
            <Input id="password" name="password" type="text" required />
            {state?.ok === false && state.errors?.password && (
              <p className="text-destructive text-sm">
                {state.errors.password[0]}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Role</Label>
            <Select
              name="role"
              value={role}
              onValueChange={(value) => setRole((value as Role) ?? "staff")}
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select a role">
                  {(value: string | null) =>
                    value ? ROLE_LABELS[value as Role] : "Select a role"
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
          </div>
          {state?.ok === false && state.formError && (
            <p className="text-destructive text-sm">{state.formError}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Add user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
