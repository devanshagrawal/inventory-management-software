// Money is stored as integer paise (1/100 rupee) everywhere in the DB to
// keep totals and balances exact. These helpers convert to/from the rupee
// values shown in forms and PDFs.

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

export function paiseToRupees(paise: number): number {
  return paise / 100
}

export function formatPaise(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paiseToRupees(paise))
}
