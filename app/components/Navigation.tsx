'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Stack,
  Text,
  Button,
  ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconUsers,
  IconCreditCard,
  IconSettings,
  IconDashboard,
  IconLogout,
} from '@tabler/icons-react';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import Loader from './Loader';

const navigationItems = [
  { label: 'Dashboard', href: '/', icon: IconDashboard },
  { label: 'Students', href: '/students', icon: IconUsers },
  { label: 'Payments', href: '/payments', icon: IconCreditCard },
  { label: 'Settings', href: '/settings', icon: IconSettings },
];

export default function Navigation({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavClick = () => {
    // Show loader when navigation item is clicked
    setIsLoading(true);
    // Close the mobile menu when a navigation item is clicked
    close();

    // Hide loader after a short delay to simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" align="center">
          <Group align="center">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Text size="lg" fw={600}>
              Gaanavykhari
            </Text>
          </Group>
          {session && (
            <Group align="center" gap="xs" visibleFrom="sm">
              <Text
                size="sm"
                c="dimmed"
                style={{
                  whiteSpace: 'nowrap',
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={session.user?.name || ''}
              >
                {session.user?.name}
              </Text>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={handleLogout}
                title="Logout"
                size="md"
              >
                <IconLogout size={18} />
              </ActionIcon>
            </Group>
          )}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Text size="lg" fw={600} mb="md">
            Navigation
          </Text>
        </AppShell.Section>

        <AppShell.Section grow>
          <Stack gap="xs">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  leftSection={<Icon size="1.2rem" stroke={1.5} />}
                  active={isActive}
                  variant={isActive ? 'filled' : 'subtle'}
                  onClick={handleNavClick}
                />
              );
            })}
          </Stack>
        </AppShell.Section>

        {session && (
          <AppShell.Section hiddenFrom="sm">
            <Stack gap="xs" mt="md">
              <Text size="sm" c="dimmed" ta="center">
                {session.user?.name}
              </Text>
              <Button
                variant="subtle"
                color="red"
                leftSection={<IconLogout size={16} />}
                onClick={handleLogout}
                fullWidth
              >
                Logout
              </Button>
            </Stack>
          </AppShell.Section>
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        {isLoading && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <Loader size={48} />
              <Text size="sm" c="dimmed" fw={500}>
                Loading...
              </Text>
            </div>
          </div>
        )}
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
