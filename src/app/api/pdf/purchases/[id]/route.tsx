import { notFound } from "next/navigation"
import { renderToBuffer } from "@react-pdf/renderer"
import { prisma } from "@/lib/db"
import { requireUser } from "@/lib/auth/dal"
import { PurchaseBillDocument } from "@/components/pdf/PurchaseBillDocument"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireUser()
  const { id } = await params

  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: { vendor: true, items: { include: { sku: true } } },
  })

  if (!purchase) {
    notFound()
  }

  const buffer = await renderToBuffer(
    <PurchaseBillDocument purchase={purchase} />
  )

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="purchase-${purchase.id}.pdf"`,
    },
  })
}
