'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Title,
  Container,
  Stack,
  Group,
  Paper,
  Text,
  Badge,
  Card,
} from '@mantine/core';
import { IconUser, IconCalendar, IconCurrencyRupee } from '@tabler/icons-react';

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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="xs">
            Payments
          </Title>
          <Text c="dimmed" size="lg">
            Track and manage payment records
          </Text>
        </div>

        <div>
          <Group justify="space-between" mb="md">
            <Text fw={500}>Total Payments: {payments.total}</Text>
          </Group>

          <Stack gap="md">
            {payments.rows.map(payment => (
              <Card key={payment._id} withBorder padding="md">
                <Group justify="space-between" align="flex-start">
                  <div style={{ flex: 1 }}>
                    <Group gap="xs" mb={4}>
                      <IconUser size={16} />
                      <Text fw={500} size="lg">
                        {payment.student?.name || 'Unknown Student'}
                      </Text>
                    </Group>
                    <Group gap="md" c="dimmed">
                      <Group gap={4}>
                        <IconCurrencyRupee size={14} />
                        <Text size="sm">₹{payment.amount}</Text>
                      </Group>
                      {payment.date && (
                        <Group gap={4}>
                          <IconCalendar size={14} />
                          <Text size="sm">
                            {new Date(payment.date).toLocaleDateString()}
                          </Text>
                        </Group>
                      )}
                    </Group>
                  </div>
                  <Badge variant="light" color={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </Group>
              </Card>
            ))}
          </Stack>

          {payments.rows.length === 0 && (
            <Paper p="xl" withBorder>
              <Text ta="center" c="dimmed">
                No payments found.
              </Text>
            </Paper>
          )}
        </div>
      </Stack>
    </Container>
  );
}
