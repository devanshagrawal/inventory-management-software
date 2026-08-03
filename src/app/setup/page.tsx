import { redirect } from "next/navigation"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { SetupForm } from "@/components/setup-form"
import { prisma } from "@/lib/db"

// Same reasoning as src/app/login/page.tsx — must be dynamic, not
// statically prerendered against the build machine's database.
export const dynamic = "force-dynamic"

export default async function SetupPage() {
  const userCount = await prisma.user.count()
  if (userCount > 0) {
    redirect("/login")
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Create the first admin account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetupForm />
        </CardContent>
      </Card>
    </div>
  )
}
