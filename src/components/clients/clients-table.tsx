import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ClientFormDialog } from "@/components/clients/client-form-dialog"
import { ClientDeleteButton } from "@/components/clients/client-delete-button"

type Client = {
  id: string
  name: string
  address: string | null
  contactNo: string | null
  contactEmail: string | null
}

export function ClientsTable({
  clients,
  isAdmin,
}: {
  clients: Client[]
  isAdmin: boolean
}) {
  if (clients.length === 0) {
    return <p className="text-muted-foreground text-sm">No clients yet.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Contact no.</TableHead>
          <TableHead>Contact email</TableHead>
          {isAdmin && <TableHead className="w-1">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell>{client.address || "—"}</TableCell>
            <TableCell>{client.contactNo || "—"}</TableCell>
            <TableCell>{client.contactEmail || "—"}</TableCell>
            {isAdmin && (
              <TableCell className="flex gap-1">
                <ClientFormDialog
                  client={client}
                  trigger={
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  }
                />
                <ClientDeleteButton id={client.id} name={client.name} />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
