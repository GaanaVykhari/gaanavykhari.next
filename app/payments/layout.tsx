'use client';

import Providers from '@/app/providers';

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
