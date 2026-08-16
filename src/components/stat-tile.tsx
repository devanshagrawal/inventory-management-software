import { cn } from "@/lib/utils"

const ledColor = {
  neutral: "bg-primary",
  good: "bg-success",
  warning: "bg-warning",
  bad: "bg-destructive",
} as const

export function StatTile({
  label,
  value,
  tone = "neutral",
  className,
}: {
  label: string
  value: React.ReactNode
  tone?: keyof typeof ledColor
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-l-[3px] bg-card px-4 py-3.5",
        className
      )}
      style={{ borderLeftColor: `var(--${tone === "neutral" ? "primary" : tone === "good" ? "success" : tone === "warning" ? "warning" : "destructive"})` }}
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <span
          className={cn("size-1.5 shrink-0 rounded-full", ledColor[tone])}
          aria-hidden="true"
        />
        {label}
      </div>
      <div className="font-mono text-xl font-semibold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  )
}
