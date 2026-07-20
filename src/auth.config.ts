import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcryptjs from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email", placeholder: "seu@email.com" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data

          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (!user || !user.password) {
            return null
          }

          const passwordsMatch = await bcryptjs.compare(password, user.password)

          if (passwordsMatch) {
            return user
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register' || nextUrl.pathname === '/')) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
  session: { strategy: "jwt" }
} satisfies NextAuthConfig
