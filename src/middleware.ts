import NextAuth from "next-auth";
import { NextResponse } from "next/server";

// Edge-compatible config to avoid importing Prisma from auth.ts
const { auth } = NextAuth({
  providers: [], // Empty providers because Credentials requires Node.js (bcrypt, Prisma)
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as "ADMIN" | "USER";
      }
      return session;
    },
  },
});

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  
  if (!isAdmin) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
