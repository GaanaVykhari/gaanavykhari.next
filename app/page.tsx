'use client';

import { useState, useEffect } from 'react';
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
  Button,
  Loader,
} from '@mantine/core';
import {
  IconUsers,
  IconCreditCard,
  IconSettings,
  IconTrendingUp,
  IconCalendar,
} from '@tabler/icons-react';
import { HolidayModal, HolidayList } from './components/HolidayModal';
import { IHoliday } from '@/types';

export default function Home() {
  const [holidays, setHolidays] = useState<IHoliday[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);

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

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/holiday');
      const data = await response.json();
      if (data.ok) {
        setHolidays(data.data);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleHolidayCreated = () => {
    fetchHolidays();
  };

  const handleHolidayDeleted = () => {
    fetchHolidays();
  };

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
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Card
                withBorder
                padding="lg"
                radius="md"
                style={{ cursor: 'pointer' }}
                onClick={() => setModalOpened(true)}
              >
                <Group>
                  <IconCalendar size={24} color="var(--mantine-color-red-6)" />
                  <div>
                    <Text fw={500}>Schedule Holiday</Text>
                    <Text size="sm" c="dimmed">
                      Mark days as holidays
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
          </Grid>
        </div>

        {/* Upcoming Holidays */}
        {holidays.length > 0 && (
          <div>
            <Title order={2} mb="md">
              Upcoming Holidays
            </Title>
            {loading ? (
              <Paper p="md" withBorder>
                <Group justify="center">
                  <Loader size="sm" />
                  <Text>Loading holidays...</Text>
                </Group>
              </Paper>
            ) : (
              <HolidayList
                holidays={holidays}
                onHolidayDeleted={handleHolidayDeleted}
              />
            )}
          </div>
        )}

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

      <HolidayModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onHolidayCreated={handleHolidayCreated}
      />
    </Container>
  );
}
