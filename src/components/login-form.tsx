"use client"

import { useActionState } from "react"
import { login, type LoginState } from "@/lib/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    undefined
  )

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Username</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
        {state?.errors?.email && (
          <p className="text-destructive text-sm">{state.errors.email[0]}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {state?.errors?.password && (
          <p className="text-destructive text-sm">
            {state.errors.password[0]}
          </p>
        )}
      </div>
      {state?.formError && (
        <p className="text-destructive text-sm">{state.formError}</p>
      )}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}
