import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import type { NextAuthOptions, Session } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get('token')?.value;
  return cookieToken || null;
}

export function buildAuthHeaders<T extends Record<string, string>>(
  extraHeaders: T = {} as T
): T {
  const headers = { ...extraHeaders } as T;
  return headers;
}

export async function getAuthHeadersAsync<T extends Record<string, string>>(
  extraHeaders: T = {} as T
): Promise<T> {
  const headers = { ...extraHeaders } as T;
  const cookieToken = await getAuthToken();
  if (cookieToken) {
    (headers as any).Authorization = `Bearer ${cookieToken}`;
    return headers;
  }
  try {
    const session = (await getServerSession(
      authOptions as NextAuthOptions
    )) as Session & { backendToken?: string };
    const backendToken = session?.backendToken;
    if (backendToken) (headers as any).Authorization = `Bearer ${backendToken}`;
  } catch {}
  return headers;
}
