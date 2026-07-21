"use client"

import { useActionState } from "react"
import { authenticate } from "@/actions/auth"
import { AuthForm } from "@/components/ui/AuthForm"

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <AuthForm
      title="Login"
      description="Insira seu e-mail e senha para acessar sua carteira"
      submitLabel="Entrar"
      errorMessage={errorMessage}
      dispatch={dispatch}
      footerText="Não tem uma conta?"
      footerLinkHref="/register"
      footerLinkLabel="Criar conta"
    />
  );
}
