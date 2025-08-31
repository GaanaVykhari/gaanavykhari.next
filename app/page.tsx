'use client';

import {
  Container,
  Grid,
  Paper,
  Stack,
  Text,
  Title,
  Card,
  Group,
  Badge,
} from '@mantine/core';
import {
  IconUsers,
  IconCreditCard,
  IconSettings,
  IconTrendingUp,
} from '@tabler/icons-react';

export default function Home() {
  const stats = [
    {
      title: 'Total Students',
      value: '156',
      icon: IconUsers,
      color: 'blue',
      change: '+12%',
    },
    {
      title: 'Active Payments',
      value: '₹45,230',
      icon: IconCreditCard,
      color: 'green',
      change: '+8%',
    },
    {
      title: 'This Month',
      value: '₹12,450',
      icon: IconTrendingUp,
      color: 'orange',
      change: '+15%',
    },
  ];

  const quickActions = [
    {
      title: 'Add New Student',
      href: '/students',
      icon: IconUsers,
      color: 'blue',
    },
    {
      title: 'Record Payment',
      href: '/payments',
      icon: IconCreditCard,
      color: 'green',
    },
    {
      title: 'System Settings',
      href: '/settings',
      icon: IconSettings,
      color: 'gray',
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="xs">
            Dashboard
          </Title>
          <Text c="dimmed" size="lg">
            Welcome to Gaanavykhari Student Management System
          </Text>
        </div>

        {/* Stats Cards */}
        <Grid>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
                <Paper p="md" withBorder>
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                        {stat.title}
                      </Text>
                      <Text size="xl" fw={700} mt={4}>
                        {stat.value}
                      </Text>
                    </div>
                    <Badge color={stat.color} variant="light">
                      {stat.change}
                    </Badge>
                  </Group>
                  <Icon
                    size={24}
                    color={`var(--mantine-color-${stat.color}-6)`}
                    style={{ marginTop: 16 }}
                  />
                </Paper>
              </Grid.Col>
            );
          })}
        </Grid>

        {/* Quick Actions */}
        <div>
          <Title order={2} mb="md">
            Quick Actions
          </Title>
          <Grid>
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card
                    withBorder
                    padding="lg"
                    radius="md"
                    style={{ cursor: 'pointer' }}
                    onClick={() => (window.location.href = action.href)}
                  >
                    <Group>
                      <Icon
                        size={24}
                        color={`var(--mantine-color-${action.color}-6)`}
                      />
                      <div>
                        <Text fw={500}>{action.title}</Text>
                        <Text size="sm" c="dimmed">
                          Click to access
                        </Text>
                      </div>
                    </Group>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>
        </div>

        {/* Recent Activity */}
        <div>
          <Title order={2} mb="md">
            Recent Activity
          </Title>
          <Paper p="md" withBorder>
            <Text c="dimmed">No recent activity to display</Text>
          </Paper>
        </div>
      </Stack>
    </Container>
  );
}
