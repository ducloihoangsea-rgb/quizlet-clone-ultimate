import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { env } from "../env";

export const edgeConfig = {
  secret: env.AUTH_SECRET || "fallback_secret_for_development_and_vercel_preview",
  session: { strategy: "jwt" as const },
  providers: [],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        },
      };
    },
  },
} satisfies NextAuthConfig;

export const { auth: edgeAuth } = NextAuth(edgeConfig);
