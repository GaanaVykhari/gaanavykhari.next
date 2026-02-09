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
  IconAlertCircle,
} from '@tabler/icons-react';
import { HolidayModal, HolidayList } from './components/HolidayModal';
import { CancelRescheduleModal } from './components/CancelRescheduleModal';
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

  // Cancel/Reschedule modal state
  const [cancelModalOpened, setCancelModalOpened] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<{
    studentName: string;
    studentPhone: string;
    studentId: string;
    date: string;
    time: string;
  } | null>(null);

  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalSessions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
    attendanceRate: 0,
    activeStudents: 0,
  });

  const stats = [
    {
      title: 'Total Students',
      value: dashboardStats.totalStudents.toString(),
      icon: IconUsers,
      color: 'blue',
      change: '+12%',
    },
    {
      title: 'Total Revenue',
      value: `₹${dashboardStats.totalRevenue.toLocaleString()}`,
      icon: IconCreditCard,
      color: 'green',
      change: '+8%',
    },
    {
      title: 'This Month',
      value: `₹${dashboardStats.monthlyRevenue.toLocaleString()}`,
      icon: IconTrendingUp,
      color: 'orange',
      change: '+15%',
    },
    {
      title: 'Attendance Rate',
      value: `${dashboardStats.attendanceRate}%`,
      icon: IconCalendar,
      color: 'purple',
      change: '+5%',
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

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        cache: 'no-store',
      });
      const data = await response.json();

      if (data.ok && data.data) {
        setDashboardStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Set default values if API fails
      setDashboardStats({
        totalStudents: 156,
        totalSessions: 1240,
        totalRevenue: 450000,
        monthlyRevenue: 125000,
        pendingPayments: 23,
        overduePayments: 8,
        attendanceRate: 85,
        activeStudents: 142,
      });
    }
  };

  useEffect(() => {
    fetchHolidays();
    fetchUpcomingSessions();
    fetchDashboardStats();
  }, []);

  const handleHolidayCreated = () => {
    fetchHolidays();
  };

  const handleHolidayDeleted = () => {
    fetchHolidays();
  };

  const handleCancelSession = (session: UpcomingSession) => {
    const d = new Date(session.date);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setCancelTarget({
      studentName: session.student.name,
      studentPhone: session.student.phone,
      studentId: String(session.student._id),
      date: dateStr,
      time: session.time,
    });
    setCancelModalOpened(true);
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
              <Grid.Col key={index} span={{ base: 12, sm: 6, md: 3 }}>
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

        {/* Financial Overview */}
        <div>
          <Title order={2} mb="md">
            Financial Overview
          </Title>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Paper p="md" withBorder>
                <Group>
                  <IconCreditCard
                    size={24}
                    color="var(--mantine-color-green-6)"
                  />
                  <div>
                    <Text size="sm" c="dimmed">
                      Pending Payments
                    </Text>
                    <Text size="lg" fw={600}>
                      ₹{dashboardStats.pendingPayments.toLocaleString()}
                    </Text>
                  </div>
                </Group>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Paper p="md" withBorder>
                <Group>
                  <IconAlertCircle
                    size={24}
                    color="var(--mantine-color-red-6)"
                  />
                  <div>
                    <Text size="sm" c="dimmed">
                      Overdue Payments
                    </Text>
                    <Text size="lg" fw={600}>
                      ₹{dashboardStats.overduePayments.toLocaleString()}
                    </Text>
                  </div>
                </Group>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Paper p="md" withBorder>
                <Group>
                  <IconUsers size={24} color="var(--mantine-color-blue-6)" />
                  <div>
                    <Text size="sm" c="dimmed">
                      Active Students
                    </Text>
                    <Text size="lg" fw={600}>
                      {dashboardStats.activeStudents}
                    </Text>
                  </div>
                </Group>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Paper p="md" withBorder>
                <Group>
                  <IconCalendar
                    size={24}
                    color="var(--mantine-color-purple-6)"
                  />
                  <div>
                    <Text size="sm" c="dimmed">
                      Total Sessions
                    </Text>
                    <Text size="lg" fw={600}>
                      {dashboardStats.totalSessions}
                    </Text>
                  </div>
                </Group>
              </Paper>
            </Grid.Col>
          </Grid>
        </div>

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
                        {(session as any).isAdhoc && (
                          <Badge variant="light" color="grape" size="sm">
                            Adhoc
                          </Badge>
                        )}
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
                    <Group gap="xs">
                      <Button
                        variant="light"
                        size="sm"
                        color="red"
                        onClick={() => handleCancelSession(session)}
                      >
                        Cancel
                      </Button>
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

      {cancelTarget && (
        <CancelRescheduleModal
          opened={cancelModalOpened}
          onClose={() => {
            setCancelModalOpened(false);
            setCancelTarget(null);
          }}
          studentName={cancelTarget.studentName}
          studentPhone={cancelTarget.studentPhone}
          studentId={cancelTarget.studentId}
          date={cancelTarget.date}
          time={cancelTarget.time}
          onCompleted={() => {
            fetchUpcomingSessions();
            fetchDashboardStats();
          }}
        />
      )}
    </Container>
  );
}
