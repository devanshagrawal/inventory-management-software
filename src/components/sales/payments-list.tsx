import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatPaise } from "@/lib/money"

type Payment = {
  id: string
  amountPaise: number
  paymentDate: Date
  method: string | null
  notes: string | null
}

export function PaymentsList({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No payments recorded yet.</p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              {payment.paymentDate.toLocaleDateString("en-IN")}
            </TableCell>
            <TableCell>{formatPaise(payment.amountPaise)}</TableCell>
            <TableCell>{payment.method || "—"}</TableCell>
            <TableCell>{payment.notes || "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
