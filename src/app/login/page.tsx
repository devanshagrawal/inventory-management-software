import { redirect } from "next/navigation"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { LoginForm } from "@/components/login-form"
import { prisma } from "@/lib/db"

// Must not be statically prerendered — the user-count check needs to run
// against each install's actual database at request time, not once at
// build time (which would otherwise bake in whatever the build machine's
// database happened to contain).
export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const userCount = await prisma.user.count()
  if (userCount === 0) {
    redirect("/setup")
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Inventory Dashboard</CardTitle>
          <CardDescription>Sign in to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
