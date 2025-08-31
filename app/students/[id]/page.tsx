'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Anchor,
  Paper,
  Stack,
  Text,
  Title,
  Button,
  Group,
  ActionIcon,
  Badge,
} from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import EditStudentForm from '@/app/components/EditStudentForm';
import type { IStudent } from '@/types';

export default function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [student, setStudent] = useState<IStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/student/${id}`, { cache: 'no-store' });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch student');
        }

        setStudent(data || null);
      } catch (error) {
        console.error('Error loading student:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <main style={{ padding: 16 }}>Loading...</main>;
  }
  if (!student) {
    return <main style={{ padding: 16 }}>Student not found</main>;
  }

  return (
    <main style={{ padding: 16 }}>
      <Group justify="space-between" align="flex-start">
        <div>
          <Anchor component={Link} href="/students">
            ← Back to Students
          </Anchor>
          <Title order={2} mt="sm">
            {student.name}
          </Title>
        </div>
        <Group>
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={openEditModal}
            title="Edit student"
          >
            <IconEdit size={20} />
          </ActionIcon>
        </Group>
      </Group>

      <Paper withBorder shadow="sm" p="md" mt="md">
        <Stack gap="md">
          <Group gap="md">
            <Text>
              <b>Email:</b> {student.email}
            </Text>
            <Text>
              <b>Phone:</b> {student.phone}
            </Text>
          </Group>

          <Group gap="md">
            <Text>
              <b>Fees:</b> ₹{student.fees?.amount} for{' '}
              {student.fees?.perClasses} sessions
            </Text>
            <Badge variant="light" color="blue">
              {student.schedule.frequency}
            </Badge>
          </Group>

          <Group gap="md">
            <Text>
              <b>Induction Date:</b>{' '}
              {new Date(student.inductionDate).toLocaleDateString()}
            </Text>
            <Text>
              <b>Class Time:</b> {student.schedule.time}
            </Text>
          </Group>

          {student.schedule.frequency === 'weekly' &&
            student.schedule.daysOfTheWeek.length > 0 && (
              <Text>
                <b>Class Days:</b>{' '}
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
            )}

          {student.schedule.frequency === 'monthly' &&
            student.schedule.daysOfTheMonth.length > 0 && (
              <Text>
                <b>Class Days:</b> {student.schedule.daysOfTheMonth.join(', ')}{' '}
                of each month
              </Text>
            )}
        </Stack>
      </Paper>

      <EditStudentForm
        opened={editModalOpened}
        onClose={closeEditModal}
        student={student}
      />
    </main>
  );
}
