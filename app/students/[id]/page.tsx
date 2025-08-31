'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Anchor, Paper, Stack, Text, Title } from '@mantine/core';

export default function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/student/${id}`, { cache: 'no-store' });
      const data = await res.json();
      setStudent(data || null);
    }
    load();
  }, [id]);

  if (!student) return <main style={{ padding: 16 }}>Loading...</main>;

  return (
    <main style={{ padding: 16 }}>
      <Anchor component={Link} href="/students">
        ← Back
      </Anchor>
      <Title order={2} mt="sm">
        {student.name}
      </Title>
      <Paper withBorder shadow="sm" p="md" mt="md">
        <Stack gap={6}>
          <Text>
            <b>Email:</b> {student.email}
          </Text>
          <Text>
            <b>Phone:</b> +{student.phone}
          </Text>
          <Text>
            <b>Fees:</b> ₹{student?.fees?.amount} for{' '}
            {student?.fees?.perClasses} sessions
          </Text>
        </Stack>
      </Paper>
    </main>
  );
}
