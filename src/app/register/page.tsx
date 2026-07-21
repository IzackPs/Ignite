"use client"

import { useActionState } from "react"
import { register } from "@/actions/auth"
import { AuthForm } from "@/components/ui/AuthForm"

export default function RegisterPage() {
  const [errorMessage, dispatch] = useActionState(register, undefined);

  return (
    <AuthForm
      title="Criar Conta"
      description="Insira seus dados para criar sua conta de gerenciamento de carteira"
      submitLabel="Registrar"
      errorMessage={errorMessage}
      dispatch={dispatch}
      isRegister={true}
      footerText="Já tem uma conta?"
      footerLinkHref="/login"
      footerLinkLabel="Fazer login"
    />
  );
}
