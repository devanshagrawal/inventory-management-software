import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SkuFormDialog } from "@/components/skus/sku-form-dialog"
import { SkuDeleteButton } from "@/components/skus/sku-delete-button"

type Sku = {
  id: string
  companyName: string
  modelName: string
  modelDescription: string | null
  stockQty: number
}

export function SkusTable({
  skus,
  isAdmin,
}: {
  skus: Sku[]
  isAdmin: boolean
}) {
  if (skus.length === 0) {
    return <p className="text-muted-foreground text-sm">No SKUs yet.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Stock</TableHead>
          {isAdmin && <TableHead className="w-1">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {skus.map((sku) => (
          <TableRow key={sku.id}>
            <TableCell className="font-medium">{sku.companyName}</TableCell>
            <TableCell>{sku.modelName}</TableCell>
            <TableCell className="max-w-xs truncate">
              {sku.modelDescription || "—"}
            </TableCell>
            <TableCell>
              <Badge variant={sku.stockQty > 0 ? "secondary" : "destructive"}>
                {sku.stockQty}
              </Badge>
            </TableCell>
            {isAdmin && (
              <TableCell className="flex gap-1">
                <SkuFormDialog
                  sku={sku}
                  trigger={
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  }
                />
                <SkuDeleteButton
                  id={sku.id}
                  name={`${sku.companyName} ${sku.modelName}`}
                />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
