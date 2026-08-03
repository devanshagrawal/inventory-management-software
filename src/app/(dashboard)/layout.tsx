import { DashboardShell } from "@/components/dashboard-shell"
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
    <DashboardShell user={user} navItems={visibleNavItems}>
      {children}
    </DashboardShell>
  )
}
