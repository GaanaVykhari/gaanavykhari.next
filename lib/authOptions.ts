import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getDb } from '@/lib/mongo';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return false;
      const email = user?.email?.toLowerCase();
      if (!email) return false;
      const db = await getDb();
      const allowed = await db.collection('users').findOne({ username: email });
      if (!allowed) return false;
      try {
        const res = await fetch(
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/user/google-login`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name: user?.name }),
          }
        );
        const data = await res.json();
        if (res.ok && (data as any)?.token) {
          (user as any).__backendToken = (data as any).token;
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    async session({ session, token, user }) {
      const backendToken =
        (user as any)?.__backendToken || (token as any)?.backendToken;
      if (backendToken) (session as any).backendToken = backendToken;
      return session;
    },
    async jwt({ token, user }) {
      if (user && (user as any).__backendToken)
        (token as any).backendToken = (user as any).__backendToken;
      return token;
    },
  },
};
