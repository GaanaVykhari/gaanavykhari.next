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
  IconClock,
  IconArrowRight,
} from '@tabler/icons-react';
import { HolidayModal, HolidayList } from './components/HolidayModal';
import { IHoliday } from '@/types';
import { formatTime, getRelativeDateString } from '@/lib/scheduleUtils';
import { UpcomingSession } from '@/types';

export default function Home() {
  const [holidays, setHolidays] = useState<IHoliday[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>(
    []
  );
  const [studentsLoading, setStudentsLoading] = useState(false);

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
    } catch {
      // Silently handle error - could be logged to error reporting service in production
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingSessions = async () => {
    setStudentsLoading(true);
    try {
      const response = await fetch('/api/schedule/upcoming?limit=5', {
        cache: 'no-store',
      });
      const data = await response.json();

      if (data.ok && data.data) {
        // Convert date strings back to Date objects
        const sessionsWithDates = data.data.map((session: any) => ({
          ...session,
          date: new Date(session.date),
          student: {
            ...session.student,
            inductionDate: new Date(session.student.inductionDate),
            lastClassDate: session.student.lastClassDate
              ? new Date(session.student.lastClassDate)
              : null,
          },
        }));
        setUpcomingSessions(sessionsWithDates);
      }
    } catch {
      // Silently handle error - could be logged to error reporting service in production
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
    fetchUpcomingSessions();
  }, []);

  const handleHolidayCreated = () => {
    fetchHolidays();
  };

  const handleHolidayDeleted = () => {
    fetchHolidays();
  };

  return (
    <Container size="xl" pt="xl" pb={{ base: '6rem', sm: 'xl' }}>
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

        {/* Upcoming Sessions */}
        <div>
          <Group justify="space-between" align="flex-end" mb="md">
            <Title order={2}>Upcoming Sessions</Title>
            <Button
              variant="subtle"
              rightSection={<IconArrowRight size={16} />}
              onClick={() => (window.location.href = '/schedule')}
            >
              View Full Schedule
            </Button>
          </Group>

          {studentsLoading ? (
            <Paper p="md" withBorder>
              <Group justify="center">
                <Loader size="sm" />
                <Text>Loading upcoming sessions...</Text>
              </Group>
            </Paper>
          ) : upcomingSessions.length === 0 ? (
            <Paper p="xl" withBorder>
              <Stack align="center" gap="md">
                <IconClock size={48} color="var(--mantine-color-gray-5)" />
                <div style={{ textAlign: 'center' }}>
                  <Text fw={500} mb="xs">
                    No upcoming sessions
                  </Text>
                  <Text c="dimmed" size="sm">
                    Add students to see their scheduled sessions here.
                  </Text>
                </div>
              </Stack>
            </Paper>
          ) : (
            <Stack gap="md">
              {upcomingSessions.map((session, index) => (
                <Card
                  key={`${session.student._id}-${index}`}
                  withBorder
                  padding="md"
                >
                  <Group justify="space-between" align="center">
                    <div style={{ flex: 1 }}>
                      <Group gap="md" mb="xs">
                        <Text fw={500} size="lg">
                          {session.student.name}
                        </Text>
                        <Badge variant="light" color="blue">
                          {getRelativeDateString(session.date)}
                        </Badge>
                      </Group>
                      <Group gap="md" c="dimmed">
                        <Group gap={4}>
                          <IconClock size={14} />
                          <Text size="sm">{formatTime(session.time)}</Text>
                        </Group>
                        <Text size="sm">
                          {session.date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                      </Group>
                    </div>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() =>
                        (window.location.href = `/students/${session.student._id}`)
                      }
                    >
                      View Details
                    </Button>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
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
      </Stack>

      <HolidayModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onHolidayCreated={handleHolidayCreated}
      />
    </Container>
  );
}
