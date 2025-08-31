'use client';

import { useCallback, useEffect, useState } from 'react';
import { List, Title } from '@mantine/core';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<{
    rows: any[];
    hasMore: boolean;
    total: number;
  }>({ rows: [], hasMore: false, total: 0 });
  const [page] = useState(1);

  const load = useCallback(
    async (reset = false) => {
      const params = new URLSearchParams();
      params.set('page', String(reset ? 1 : page));
      const res = await fetch(`/api/payments?${params.toString()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      setPayments(prev => ({
        total: data?.total ?? 0,
        hasMore: data?.hasMore ?? false,
        rows: reset
          ? (data?.rows ?? [])
          : [...prev.rows, ...(data?.rows ?? [])],
      }));
    },
    [page]
  );

  useEffect(() => {
    load(true);
  }, [load]);

  return (
    <main style={{ padding: 16 }}>
      <Title order={2}>Payments</Title>
      <List spacing="xs" mt="md">
        {payments.rows.map(p => (
          <List.Item key={p._id}>
            {p.student?.name} — ₹{p.amount} — {p.status}
          </List.Item>
        ))}
      </List>
    </main>
  );
}
