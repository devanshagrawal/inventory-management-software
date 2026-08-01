"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  createClient,
  updateClient,
  type ClientState,
} from "@/lib/clients/actions"

type Client = {
  id: string
  name: string
  address: string | null
  contactNo: string | null
  contactEmail: string | null
}

export function ClientFormDialog({
  client,
  trigger,
}: {
  client?: Client
  trigger: React.ReactElement
}) {
  const isEdit = !!client
  const action = isEdit ? updateClient.bind(null, client.id) : createClient
  const [state, formAction, pending] = useActionState<ClientState, FormData>(
    action,
    undefined
  )
  const [open, setOpen] = useState(false)
  const [announcedState, setAnnouncedState] = useState(state)

  if (state !== announcedState) {
    setAnnouncedState(state)
    if (state?.ok) {
      setOpen(false)
    }
  }

  useEffect(() => {
    if (state?.ok) {
      toast.success(isEdit ? "Client updated." : "Client added.")
    }
  }, [state, isEdit])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit client" : "Add client"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Client name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={client?.name}
              required
            />
            {state?.ok === false && state.errors?.name && (
              <p className="text-destructive text-sm">
                {state.errors.name[0]}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={client?.address ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contactNo">Contact no.</Label>
            <Input
              id="contactNo"
              name="contactNo"
              defaultValue={client?.contactNo ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contactEmail">Contact email</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={client?.contactEmail ?? ""}
            />
            {state?.ok === false && state.errors?.contactEmail && (
              <p className="text-destructive text-sm">
                {state.errors.contactEmail[0]}
              </p>
            )}
          </div>
          {state?.ok === false && state.formError && (
            <p className="text-destructive text-sm">{state.formError}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Save changes" : "Add client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
