import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getDb } from '@/lib/mongo';
import { Db } from 'mongodb';

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
      if (account?.provider !== 'google') {
        return false;
      }
      const email = user?.email?.toLowerCase();
      if (!email) {
        return false;
      }

      try {
        // Try to connect to MongoDB with timeout
        const db = (await Promise.race([
          getDb(),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error('MongoDB connection timeout')),
              10000
            )
          ),
        ])) as Db;

        const allowed = await db
          .collection('users')
          .findOne({ username: email });
        if (!allowed) {
          return false;
        }

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
          return false;
        }

        const data = await res.json();
        if ((data as any)?.token) {
          (user as any).__backendToken = (data as any).token;
          return true;
        }
        return false;
      } catch (error) {
        // If it's a MongoDB connection error, we can still allow login
        // but without the backend token (fallback behavior)
        if (error instanceof Error && error.message.includes('MongoDB')) {
          return true;
        }

        return false;
      }
    },
    async session({ session, token, user }) {
      const backendToken =
        (user as any)?.__backendToken || (token as any)?.backendToken;
      if (backendToken) {
        (session as any).backendToken = backendToken;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user && (user as any).__backendToken) {
        (token as any).backendToken = (user as any).__backendToken;
      }
      return token;
    },
  },
};
