'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Anchor, Button, List, TextInput, Title } from '@mantine/core';

export default function StudentsPage() {
  const [students, setStudents] = useState<{
    rows: any[];
    hasMore: boolean;
    total: number;
  }>({ rows: [], hasMore: false, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useMemo(() => search, [search]);

  const load = async ({ reset = false } = {}) => {
    const params = new URLSearchParams();
    params.set('page', String(reset ? 1 : page));
    if (debouncedSearch) params.set('search', debouncedSearch);
    const res = await fetch(`/api/student/all?${params.toString()}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    setStudents(prev => ({
      total: data?.total ?? 0,
      hasMore: data?.hasMore ?? false,
      rows: reset ? (data?.rows ?? []) : [...prev.rows, ...(data?.rows ?? [])],
    }));
  };

  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    if (page > 1) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <main style={{ padding: 24 }}>
      <Title order={2}>Students</Title>
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <TextInput
          placeholder="Search by name/email/phone"
          value={search}
          onChange={e => setSearch(e.currentTarget.value)}
          style={{ flex: 1, maxWidth: 480 }}
        />
        <Button onClick={() => load({ reset: true })}>Search</Button>
      </div>
      <List spacing="xs" mt="md">
        {students.rows.map(s => (
          <List.Item key={s._id}>
            <Anchor component={Link} href={`/students/${s._id}`}>
              {s.name} — {s.email}
            </Anchor>
          </List.Item>
        ))}
      </List>
      {students.hasMore && (
        <Button mt="md" onClick={() => setPage(p => p + 1)}>
          Load more
        </Button>
      )}
    </main>
  );
}
