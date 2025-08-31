'use client';

import Providers from '@/app/providers';

export default function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
