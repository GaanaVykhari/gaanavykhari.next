'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Anchor,
  Paper,
  Stack,
  Text,
  Title,
  Group,
  Badge,
  Container,
  Grid,
  Card,
  Button,
  Tabs,
  Progress,
  Alert,
  Loader,
  Divider,
} from '@mantine/core';
import {
  IconEdit,
  IconUser,
  IconMail,
  IconPhone,
  IconCalendar,
  IconClock,
  IconCurrencyRupee,
  IconTrendingUp,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconCalendarEvent,
  IconCreditCard,
  IconChartBar,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import EditStudentForm from '@/app/components/EditStudentForm';
import SessionManager from '@/app/components/SessionManager';
import type { IStudent } from '@/types';
import { format } from 'date-fns';

interface StudentStats {
  totalSessions: number;
  attendedSessions: number;
  missedSessions: number;
  canceledSessions: number;
  attendanceRate: number;
  totalPaid: number;
  pendingPayments: number;
  overduePayments: number;
}

interface Payment {
  _id: string;
  amount: number;
  dueDate: Date;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  paymentDate?: Date;
  notes?: string;
}

export default function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [student, setStudent] = useState<IStudent | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      // Load student details
      const studentRes = await fetch(`/api/student/${id}`, {
        cache: 'no-store',
      });
      const studentData = await studentRes.json();

      if (!studentRes.ok) {
        throw new Error(studentData.message || 'Failed to fetch student');
      }

      setStudent(studentData || null);

      // Load student stats
      const statsRes = await fetch(`/api/student/${id}/stats`, {
        cache: 'no-store',
      });
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setStats(statsData.data);
      }

      // Load student payments
      const paymentsRes = await fetch(`/api/student/${id}/payments`, {
        cache: 'no-store',
      });
      const paymentsData = await paymentsRes.json();
      if (paymentsRes.ok) {
        setPayments(paymentsData.data || []);
      }
    } catch (error) {
      console.error('Failed to load student data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [id]);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center" py="xl">
          <Loader size="lg" />
          <Text>Loading student details...</Text>
        </Group>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container size="xl" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Student Not Found"
          color="red"
        >
          The requested student could not be found.
        </Alert>
      </Container>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'overdue':
        return 'red';
      case 'cancelled':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <IconCheck size={16} />;
      case 'pending':
        return <IconClock size={16} />;
      case 'overdue':
        return <IconAlertCircle size={16} />;
      case 'cancelled':
        return <IconX size={16} />;
      default:
        return <IconClock size={16} />;
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Anchor component={Link} href="/students">
              ← Back to Students
            </Anchor>
            <Title order={1} mt="sm" mb="xs">
              {student.name}
            </Title>
            <Text c="dimmed" size="lg">
              Student Profile & Management
            </Text>
          </div>
          <Group>
            <Button
              leftSection={<IconEdit size={16} />}
              onClick={openEditModal}
              variant="light"
            >
              Edit Student
            </Button>
          </Group>
        </Group>

        {/* Stats Cards */}
        {stats && (
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder padding="md">
                <Group>
                  <IconCalendarEvent
                    size={24}
                    color="var(--mantine-color-blue-6)"
                  />
                  <div>
                    <Text size="sm" c="dimmed">
                      Total Sessions
                    </Text>
                    <Text size="lg" fw={600}>
                      {stats.totalSessions}
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder padding="md">
                <Group>
                  <IconCheck size={24} color="var(--mantine-color-green-6)" />
                  <div>
                    <Text size="sm" c="dimmed">
                      Attended
                    </Text>
                    <Text size="lg" fw={600}>
                      {stats.attendedSessions}
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder padding="md">
                <Group>
                  <IconTrendingUp
                    size={24}
                    color="var(--mantine-color-orange-6)"
                  />
                  <div>
                    <Text size="sm" c="dimmed">
                      Attendance Rate
                    </Text>
                    <Text size="lg" fw={600}>
                      {stats.attendanceRate}%
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder padding="md">
                <Group>
                  <IconCurrencyRupee
                    size={24}
                    color="var(--mantine-color-green-6)"
                  />
                  <div>
                    <Text size="sm" c="dimmed">
                      Total Paid
                    </Text>
                    <Text size="lg" fw={600}>
                      ₹{stats.totalPaid}
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
          </Grid>
        )}

        {/* Student Information */}
        <Paper withBorder p="md">
          <Title order={2} mb="md">
            Student Information
          </Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="sm">
                <Group>
                  <IconUser size={16} />
                  <Text fw={500}>Name:</Text>
                  <Text>{student.name}</Text>
                </Group>
                <Group>
                  <IconMail size={16} />
                  <Text fw={500}>Email:</Text>
                  <Text>{student.email}</Text>
                </Group>
                <Group>
                  <IconPhone size={16} />
                  <Text fw={500}>Phone:</Text>
                  <Text>{student.phone}</Text>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="sm">
                <Group>
                  <IconCalendar size={16} />
                  <Text fw={500}>Induction Date:</Text>
                  <Text>
                    {format(new Date(student.inductionDate), 'MMM dd, yyyy')}
                  </Text>
                </Group>
                <Group>
                  <IconClock size={16} />
                  <Text fw={500}>Class Time:</Text>
                  <Text>{student.schedule.time}</Text>
                </Group>
                <Group>
                  <IconCurrencyRupee size={16} />
                  <Text fw={500}>Fees:</Text>
                  <Text>
                    ₹{student.fees?.amount} for {student.fees?.perClasses}{' '}
                    sessions
                  </Text>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>

          <Divider my="md" />

          <Stack gap="sm">
            <Group>
              <Text fw={500}>Schedule:</Text>
              <Badge variant="light" color="blue">
                {student.schedule.frequency}
              </Badge>
            </Group>

            {student.schedule.frequency === 'weekly' &&
              student.schedule.daysOfTheWeek.length > 0 && (
                <Group>
                  <Text fw={500}>Class Days:</Text>
                  <Text>
                    {student.schedule.daysOfTheWeek
                      .map(day => {
                        const days = [
                          'Sunday',
                          'Monday',
                          'Tuesday',
                          'Wednesday',
                          'Thursday',
                          'Friday',
                          'Saturday',
                        ];
                        return days[day];
                      })
                      .join(', ')}
                  </Text>
                </Group>
              )}

            {student.schedule.frequency === 'monthly' &&
              student.schedule.daysOfTheMonth.length > 0 && (
                <Group>
                  <Text fw={500}>Class Days:</Text>
                  <Text>
                    {student.schedule.daysOfTheMonth.join(', ')} of each month
                  </Text>
                </Group>
              )}
          </Stack>
        </Paper>

        {/* Tabs for Sessions and Payments */}
        <Tabs defaultValue="sessions">
          <Tabs.List>
            <Tabs.Tab
              value="sessions"
              leftSection={<IconCalendarEvent size={16} />}
            >
              Sessions
            </Tabs.Tab>
            <Tabs.Tab
              value="payments"
              leftSection={<IconCreditCard size={16} />}
            >
              Payments
            </Tabs.Tab>
            <Tabs.Tab
              value="analytics"
              leftSection={<IconChartBar size={16} />}
            >
              Analytics
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="sessions" pt="md">
            <SessionManager studentId={id} onSessionUpdated={loadStudentData} />
          </Tabs.Panel>

          <Tabs.Panel value="payments" pt="md">
            <Paper withBorder p="md">
              <Group justify="space-between" mb="md">
                <Title order={3}>Payment History</Title>
                <Button
                  leftSection={<IconCreditCard size={16} />}
                  onClick={() =>
                    (window.location.href = `/payments?student=${id}`)
                  }
                >
                  Add Payment
                </Button>
              </Group>

              {payments.length === 0 ? (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="No Payments"
                  color="blue"
                >
                  No payment records found for this student.
                </Alert>
              ) : (
                <Stack gap="md">
                  {payments.map(payment => (
                    <Card key={payment._id} withBorder padding="md">
                      <Group justify="space-between" align="center">
                        <div>
                          <Group gap="md" mb="xs">
                            <Text fw={500}>₹{payment.amount}</Text>
                            <Badge
                              color={getStatusColor(payment.status)}
                              variant="light"
                              leftSection={getStatusIcon(payment.status)}
                            >
                              {payment.status.charAt(0).toUpperCase() +
                                payment.status.slice(1)}
                            </Badge>
                          </Group>
                          <Group gap="md" c="dimmed">
                            <Text size="sm">
                              Due:{' '}
                              {format(
                                new Date(payment.dueDate),
                                'MMM dd, yyyy'
                              )}
                            </Text>
                            {payment.paymentDate && (
                              <Text size="sm">
                                Paid:{' '}
                                {format(
                                  new Date(payment.paymentDate),
                                  'MMM dd, yyyy'
                                )}
                              </Text>
                            )}
                          </Group>
                          {payment.notes && (
                            <Text size="sm" c="dimmed" mt="xs">
                              {payment.notes}
                            </Text>
                          )}
                        </div>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              )}
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="analytics" pt="md">
            <Paper withBorder p="md">
              <Title order={3} mb="md">
                Performance Analytics
              </Title>

              {stats && (
                <Stack gap="md">
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text fw={500}>Attendance Rate</Text>
                      <Text fw={500}>{stats.attendanceRate}%</Text>
                    </Group>
                    <Progress
                      value={stats.attendanceRate}
                      size="lg"
                      radius="xl"
                    />
                  </div>

                  <Grid>
                    <Grid.Col span={6}>
                      <Card withBorder padding="sm">
                        <Text size="sm" c="dimmed">
                          Sessions Attended
                        </Text>
                        <Text size="xl" fw={600} c="green">
                          {stats.attendedSessions}
                        </Text>
                      </Card>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Card withBorder padding="sm">
                        <Text size="sm" c="dimmed">
                          Sessions Missed
                        </Text>
                        <Text size="xl" fw={600} c="red">
                          {stats.missedSessions}
                        </Text>
                      </Card>
                    </Grid.Col>
                  </Grid>

                  <Grid>
                    <Grid.Col span={6}>
                      <Card withBorder padding="sm">
                        <Text size="sm" c="dimmed">
                          Total Paid
                        </Text>
                        <Text size="xl" fw={600} c="green">
                          ₹{stats.totalPaid}
                        </Text>
                      </Card>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Card withBorder padding="sm">
                        <Text size="sm" c="dimmed">
                          Pending Payments
                        </Text>
                        <Text size="xl" fw={600} c="yellow">
                          ₹{stats.pendingPayments}
                        </Text>
                      </Card>
                    </Grid.Col>
                  </Grid>
                </Stack>
              )}
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <EditStudentForm
        opened={editModalOpened}
        onClose={closeEditModal}
        student={student}
      />
    </Container>
  );
}
