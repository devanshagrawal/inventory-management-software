import { SidebarNav } from "@/components/sidebar-nav"
import { UserMenu } from "@/components/user-menu"
import { requireUser } from "@/lib/auth/dal"
import { navItems } from "@/lib/nav-items"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()
  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || user.role === "admin"
  )

  return (
    <div className="flex flex-1">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/30">
        <div className="border-b px-4 py-4">
          <span className="text-sm font-semibold">Inventory Dashboard</span>
        </div>
        <SidebarNav items={visibleNavItems} />
        <div className="mt-auto">
          <UserMenu email={user.email} role={user.role} />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
