import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Ignora rotas da API, assets estáticos (imagens, favicon, etc) e rotas internas do Next.js
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
