import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import NextLink from "next/link";
import React from "react";

interface AuthFormProps {
  title: string;
  description: string;
  submitLabel: string;
  errorMessage?: string;
  dispatch: (payload: FormData) => void;
  isRegister?: boolean;
  footerText: string;
  footerLinkHref: string;
  footerLinkLabel: string;
}

export function AuthForm({
  title,
  description,
  submitLabel,
  errorMessage,
  dispatch,
  isRegister,
  footerText,
  footerLinkHref,
  footerLinkLabel,
}: Readonly<AuthFormProps>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <form action={dispatch}>
          <CardContent className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu Nome"
                  required
                />
              </div>
            )}
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
              {submitLabel}
            </Button>
            <div className="text-sm text-center text-slate-500 dark:text-slate-400">
              {footerText}{" "}
              <NextLink href={footerLinkHref} className="text-blue-600 hover:underline dark:text-blue-500">
                {footerLinkLabel}
              </NextLink>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
