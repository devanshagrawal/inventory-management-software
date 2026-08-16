"use client"

import { useState } from "react"
import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "@/components/sidebar-nav"
import { UserMenu } from "@/components/user-menu"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/lib/nav-items"
import type { Role } from "@/lib/roles"

export function DashboardShell({
  user,
  navItems,
  children,
}: {
  user: { email: string; role: Role }
  navItems: NavItem[]
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={open ? "Hide sidebar" : "Show sidebar"}
          aria-pressed={open}
          onClick={() => setOpen((v) => !v)}
        >
          <MenuIcon className="size-4" />
        </Button>
        <span className="flex items-center gap-2 font-heading text-sm font-semibold tracking-wide">
          <span
            className="size-1.5 shrink-0 rounded-full bg-primary"
            aria-hidden="true"
          />
          Inventory Dashboard
        </span>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside
          className={cn(
            "flex shrink-0 flex-col overflow-hidden border-r bg-sidebar transition-[width] duration-200",
            open ? "w-56" : "w-0 border-r-0"
          )}
        >
          <div className="flex h-full w-56 flex-col">
            <SidebarNav items={navItems} />
            <div className="mt-auto">
              <UserMenu email={user.email} role={user.role} />
            </div>
          </div>
        </aside>
        <main className="bg-grid-paper flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
