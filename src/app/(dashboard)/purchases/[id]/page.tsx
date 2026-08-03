import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { requireUser } from "@/lib/auth/dal"
import { formatPaise } from "@/lib/money"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PurchaseDeleteButton } from "@/components/purchases/purchase-delete-button"

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireUser()

  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      vendor: true,
      items: { include: { sku: true } },
    },
  })

  if (!purchase) {
    notFound()
  }

  const total = purchase.items.reduce(
    (sum, item) => sum + item.pricePerItemPaise * item.quantity,
    0
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/purchases"
            className="text-muted-foreground text-sm underline underline-offset-2"
          >
            ← Purchases
          </Link>
          <h1 className="text-2xl font-semibold">Purchase detail</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            render={
              <a
                href={`/api/pdf/purchases/${purchase.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download PDF
              </a>
            }
          />
          {user.role === "admin" && (
            <PurchaseDeleteButton id={purchase.id} />
          )}
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Vendor
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <p className="font-medium">{purchase.vendor.name}</p>
          {purchase.vendor.address && (
            <p className="text-muted-foreground text-sm">
              {purchase.vendor.address}
            </p>
          )}
          {purchase.vendor.contactNo && (
            <p className="text-muted-foreground text-sm">
              {purchase.vendor.contactNo}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Price/item</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchase.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.sku.companyName} — {item.sku.modelName}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatPaise(item.pricePerItemPaise)}</TableCell>
                  <TableCell>
                    {formatPaise(item.pricePerItemPaise * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <p>Date: {purchase.purchaseDate.toLocaleDateString("en-IN")}</p>
          <p className="text-lg font-semibold">Total: {formatPaise(total)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
