import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { VendorFormDialog } from "@/components/vendors/vendor-form-dialog"
import { VendorDeleteButton } from "@/components/vendors/vendor-delete-button"

type Vendor = {
  id: string
  name: string
  address: string | null
  contactNo: string | null
  contactEmail: string | null
}

export function VendorsTable({
  vendors,
  isAdmin,
}: {
  vendors: Vendor[]
  isAdmin: boolean
}) {
  if (vendors.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No vendors yet.</p>
    )
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
        {vendors.map((vendor) => (
          <TableRow key={vendor.id}>
            <TableCell className="font-medium">{vendor.name}</TableCell>
            <TableCell>{vendor.address || "—"}</TableCell>
            <TableCell>{vendor.contactNo || "—"}</TableCell>
            <TableCell>{vendor.contactEmail || "—"}</TableCell>
            {isAdmin && (
              <TableCell className="flex gap-1">
                <VendorFormDialog
                  vendor={vendor}
                  trigger={
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  }
                />
                <VendorDeleteButton id={vendor.id} name={vendor.name} />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
