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
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return false;
      const email = user?.email?.toLowerCase();
      if (!email) return false;

      try {
        const db = await getDb();
        const allowed = await db
          .collection('users')
          .findOne({ username: email });
        if (!allowed) return false;

        // Use relative URL for internal API calls to avoid SSL issues
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const apiUrl = `${baseUrl}/api/user/google-login`;

        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'NextAuth.js/4.24.11',
          },
          body: JSON.stringify({ email, name: user?.name }),
        });

        if (!res.ok) {
          console.error('Google login API error:', res.status, res.statusText);
          return false;
        }

        const data = await res.json();
        if ((data as any)?.token) {
          (user as any).__backendToken = (data as any).token;
          return true;
        }
        return false;
      } catch (error) {
        console.error('SignIn callback error:', error);
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
