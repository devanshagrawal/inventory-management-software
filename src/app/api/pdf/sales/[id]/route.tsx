import { notFound } from "next/navigation"
import { renderToBuffer } from "@react-pdf/renderer"
import { prisma } from "@/lib/db"
import { requireUser } from "@/lib/auth/dal"
import { SalesInvoiceDocument } from "@/components/pdf/SalesInvoiceDocument"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireUser()
  const { id } = await params

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { client: true, sku: true },
  })

  if (!sale) {
    notFound()
  }

  const buffer = await renderToBuffer(<SalesInvoiceDocument sale={sale} />)

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${sale.id}.pdf"`,
    },
  })
}
