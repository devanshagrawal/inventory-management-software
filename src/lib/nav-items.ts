export type NavItem = {
  label: string
  href: string
  adminOnly?: boolean
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "SKUs", href: "/skus" },
  { label: "Vendors", href: "/vendors" },
  { label: "Purchases", href: "/purchases" },
  { label: "Clients", href: "/clients" },
  { label: "Sales", href: "/sales" },
  { label: "Receivables", href: "/receivables" },
  { label: "Users", href: "/users", adminOnly: true },
]
