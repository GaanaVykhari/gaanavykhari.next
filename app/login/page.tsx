'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Button, Group, Paper, Title } from '@mantine/core';
import { signIn } from 'next-auth/react';

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const onGoogle = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: redirect });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        display: 'flex',
        minHeight: '80vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper withBorder shadow="xl" radius="xl" p="xl" style={{ width: 360 }}>
        <Title order={2} mb="md">
          Gaanavykhari Music
        </Title>
        <Group justify="center">
          <Button onClick={onGoogle} loading={loading}>
            Continue with Google
          </Button>
        </Group>
      </Paper>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
