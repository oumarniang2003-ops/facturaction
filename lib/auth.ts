import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { NextAuthOptions } from "next-auth";

// Point clé du multi-tenant : chaque session contient le merchantId
// de l'utilisateur connecté. TOUTES les requêtes Prisma dans l'app
// doivent être filtrées par ce merchantId pour isoler les données
// d'un commerçant de celles d'un autre.

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { merchant: { include: { subscription: true } } },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        // Un commerçant suspendu par un super admin ne peut plus se connecter.
        if (user.merchant.subscription?.status === "CANCELED" && !user.isSuperAdmin) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          merchantId: user.merchantId,
          merchantName: user.merchant.businessName,
          isSuperAdmin: user.isSuperAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.merchantId = (user as any).merchantId;
        token.merchantName = (user as any).merchantName;
        token.role = (user as any).role;
        token.isSuperAdmin = (user as any).isSuperAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).merchantId = token.merchantId;
      (session as any).merchantName = token.merchantName;
      (session as any).role = token.role;
      (session as any).isSuperAdmin = token.isSuperAdmin;
      return session;
    },
  },
};
