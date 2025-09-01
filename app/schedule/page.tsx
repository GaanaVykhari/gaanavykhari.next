'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Badge,
  Card,
  Loader,
  Alert,
  Button,
  ActionIcon,
  Divider,
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconClock,
  IconUser,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

import { formatTime, formatDate } from '@/lib/scheduleUtils';
import { ScheduleEntry } from '@/types';

export default function SchedulePage() {
  const [todaysSchedule, setTodaysSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date();

  const loadTodaysSchedule = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/schedule/today', {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch today's schedule");
      }

      // Convert date strings back to Date objects
      const scheduleWithDates = (data.data || []).map((entry: any) => ({
        ...entry,
        student: {
          ...entry.student,
          inductionDate: new Date(entry.student.inductionDate),
          lastClassDate: entry.student.lastClassDate
            ? new Date(entry.student.lastClassDate)
            : null,
        },
      }));
      setTodaysSchedule(scheduleWithDates);
    } catch (error: any) {
      setError(error.message || "Failed to load today's schedule");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTodaysSchedule();
  }, []);

  const handleRefresh = () => {
    loadTodaysSchedule(true);
  };

  const updateSessionStatus = async (
    sessionEntry: ScheduleEntry,
    newStatus: 'attended' | 'canceled' | 'missed'
  ) => {
    // This would update the session status in the backend
    // For now, we'll just update the local state
    setTodaysSchedule(prev =>
      prev.map(entry =>
        entry.student._id === sessionEntry.student._id
          ? { ...entry, status: newStatus }
          : entry
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attended':
        return 'green';
      case 'canceled':
        return 'yellow';
      case 'missed':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'attended':
        return <IconCheck size={16} />;
      case 'canceled':
        return <IconX size={16} />;
      case 'missed':
        return <IconAlertCircle size={16} />;
      default:
        return <IconClock size={16} />;
    }
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center" py="xl">
          <Loader size="lg" />
          <Text>Loading today's schedule...</Text>
        </Group>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={1} mb="xs">
              Schedule
            </Title>
            <Text c="dimmed" size="lg">
              {formatDate(today)}
            </Text>
          </div>
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={handleRefresh}
            loading={refreshing}
            title="Refresh schedule"
          >
            <IconRefresh size={20} />
          </ActionIcon>
        </Group>

        {/* Error Alert */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="filled"
          >
            {error}
          </Alert>
        )}

        {/* Schedule Summary */}
        <Paper p="md" withBorder>
          <Group gap="xs">
            <IconCalendarEvent size={20} color="var(--mantine-color-blue-6)" />
            <div>
              <Text size="sm" c="dimmed">
                Total Sessions Today
              </Text>
              <Text size="lg" fw={600}>
                {todaysSchedule.length}
              </Text>
            </div>
          </Group>
        </Paper>

        {/* Today's Schedule */}
        <div>
          <Title order={2} mb="md">
            Today's Sessions
          </Title>

          {todaysSchedule.length === 0 ? (
            <Paper p="xl" withBorder>
              <Stack align="center" gap="md">
                <IconCalendarEvent
                  size={48}
                  color="var(--mantine-color-gray-5)"
                />
                <div style={{ textAlign: 'center' }}>
                  <Text fw={500} mb="xs">
                    No sessions scheduled for today
                  </Text>
                  <Text c="dimmed" size="sm">
                    Enjoy your free day! Check back tomorrow or add new students
                    to see their schedules.
                  </Text>
                </div>
              </Stack>
            </Paper>
          ) : (
            <Stack gap="md">
              {todaysSchedule.map((entry, index) => (
                <Card
                  key={`${entry.student._id}-${index}`}
                  withBorder
                  padding="md"
                >
                  <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Group gap="md" mb="xs">
                        <Group gap="xs">
                          <IconUser size={18} />
                          <Text fw={500} size="lg">
                            {entry.student.name}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <IconClock
                            size={16}
                            color="var(--mantine-color-blue-6)"
                          />
                          <Text fw={500} color="blue">
                            {formatTime(entry.time)}
                          </Text>
                        </Group>
                      </Group>

                      <Group gap="md" c="dimmed">
                        <Text size="sm">{entry.student.email}</Text>
                        {entry.student.phone && (
                          <Text size="sm">{entry.student.phone}</Text>
                        )}
                      </Group>

                      <Group gap="xs" mt="xs">
                        <Text size="sm" c="dimmed">
                          Schedule: {entry.student.schedule.frequency}
                        </Text>
                        <Text size="sm" c="dimmed">
                          •
                        </Text>
                        <Text size="sm" c="dimmed">
                          Fee: ₹{entry.student.fees?.amount} for{' '}
                          {entry.student.fees?.perClasses} sessions
                        </Text>
                      </Group>
                    </div>

                    <Group gap="xs" align="center">
                      <Badge
                        color={getStatusColor(entry.status)}
                        variant="light"
                        leftSection={getStatusIcon(entry.status)}
                      >
                        {entry.status.charAt(0).toUpperCase() +
                          entry.status.slice(1)}
                      </Badge>

                      {entry.status === 'scheduled' && (
                        <Group gap="xs">
                          <Button
                            size="xs"
                            variant="light"
                            color="green"
                            onClick={() =>
                              updateSessionStatus(entry, 'attended')
                            }
                          >
                            Mark Attended
                          </Button>
                          <Button
                            size="xs"
                            variant="light"
                            color="yellow"
                            onClick={() =>
                              updateSessionStatus(entry, 'canceled')
                            }
                          >
                            Cancel
                          </Button>
                          <Button
                            size="xs"
                            variant="light"
                            color="red"
                            onClick={() => updateSessionStatus(entry, 'missed')}
                          >
                            Mark Missed
                          </Button>
                        </Group>
                      )}
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </div>
      </Stack>
    </Container>
  );
}
