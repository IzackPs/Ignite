"use client"

import { useActionState } from "react"
import { authenticate } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import NextLink from "next/link"

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Login</CardTitle>
          <CardDescription>
            Insira seu e-mail e senha para acessar sua carteira
          </CardDescription>
        </CardHeader>
        <form action={dispatch}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {errorMessage && (
              <div className="text-sm text-red-500 font-medium">
                {errorMessage}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit">
              Entrar
            </Button>
            <div className="text-sm text-center text-slate-500 dark:text-slate-400">
              Não tem uma conta?{" "}
              <NextLink href="/register" className="text-blue-600 hover:underline dark:text-blue-500">
                Criar conta
              </NextLink>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
