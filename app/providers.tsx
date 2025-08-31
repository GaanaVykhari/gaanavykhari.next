'use client';

import { MantineProvider } from '@mantine/core';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MantineProvider defaultColorScheme="light">{children}</MantineProvider>
    </SessionProvider>
  );
}
