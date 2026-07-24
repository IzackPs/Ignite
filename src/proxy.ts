import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  // Configuração padrão: ignorar estáticos, Next.js internals, mas proteger APIs e rotas de app
  // Modificado: removido (?!api) para que as requisições API também passem pelo middleware
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
