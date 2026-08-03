import * as z from "zod"

export const LineItemSchema = z.object({
  skuId: z.string().trim().min(1),
  quantity: z.coerce.number().int().positive(),
  pricePerItem: z.coerce.number().positive(),
})

export type LineItem = z.infer<typeof LineItemSchema>

// Line items are submitted as a JSON string in a hidden form field (there's
// no clean native FormData shape for a dynamic array of rows), so parsing
// them is shared between purchases and sales rather than duplicated.
export function parseLineItems(
  raw: FormDataEntryValue | null
): { success: true; data: LineItem[] } | { success: false; error: string } {
  if (typeof raw !== "string" || !raw) {
    return { success: false, error: "Add at least one item." }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { success: false, error: "Invalid item data." }
  }

  const result = z
    .array(LineItemSchema)
    .min(1, { error: "Add at least one item." })
    .safeParse(parsed)

  if (!result.success) {
    return { success: false, error: "Check the item rows for errors." }
  }

  return { success: true, data: result.data }
}
