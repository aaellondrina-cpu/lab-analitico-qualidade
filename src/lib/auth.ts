import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  debug: false,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Lab Internal",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          type: "LAB",
        };
      },
    }),
    CredentialsProvider({
      id: "cliente-credentials",
      name: "Portal do Cliente",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const cu = await prisma.clienteUser.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!cu || !cu.ativo) return null;

        const ok = await bcrypt.compare(credentials.password, cu.password);
        if (!ok) return null;

        await prisma.clienteUser.update({
          where: { id: cu.id },
          data: { ultimoLogin: new Date() },
        });

        return {
          id: cu.id,
          email: cu.email,
          name: cu.nome,
          role: "CLIENTE",
          type: "CLIENT",
          clienteId: cu.clienteId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "ANALISTA";
        token.type = (user as { type?: "LAB" | "CLIENT" }).type ?? "LAB";
        token.clienteId = (user as { clienteId?: string }).clienteId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.type = (token.type as "LAB" | "CLIENT") ?? "LAB";
        session.user.clienteId = token.clienteId as string | undefined;
      }
      return session;
    },
  },
};
