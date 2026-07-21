"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
})

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData)
  } catch (error: any) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return "Credenciais inválidas."
      }
      return "Algo deu errado."
    }
    throw error
  }
}

export async function register(prevState: string | undefined, formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries())
    const validatedFields = registerSchema.safeParse(data)

    if (!validatedFields.success) {
      return "Dados inválidos. Verifique os campos preenchidos."
    }

    const { name, email, password } = validatedFields.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return "Este e-mail já está em uso."
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // Depois de registrar, faz o login automaticamente
    await signIn("credentials", formData)
  } catch (error: any) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return "Erro ao fazer login automático após registro."
      }
      return "Algo deu errado durante o registro."
    }
    throw error
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" })
}

