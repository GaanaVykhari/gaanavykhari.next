'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Anchor,
  Button,
  TextInput,
  Title,
  Container,
  Stack,
  Group,
  Paper,
  Text,
  Badge,
  Card,
  ActionIcon,
} from '@mantine/core';
import {
  IconSearch,
  IconUser,
  IconMail,
  IconPhone,
  IconUserPlus,
  IconEdit,
} from '@tabler/icons-react';
import { useDisclosure, useDebouncedState } from '@mantine/hooks';
import AddStudentForm from '@/app/components/AddStudentForm';
import EditStudentForm from '@/app/components/EditStudentForm';
import type { IStudent } from '@/types';

export default function StudentsPage() {
  const [students, setStudents] = useState<{
    rows: IStudent[];
    hasMore: boolean;
    total: number;
  }>({ rows: [], hasMore: false, total: 0 });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useDebouncedState('', 300);
  const [loading, setLoading] = useState(false);
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] =
    useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);

  const load = async ({ reset = false } = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(reset ? 1 : page));
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }
      const res = await fetch(`/api/student/all?${params.toString()}`, {
        cache: 'no-store',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch students');
      }

      setStudents(prev => ({
        total: data?.data?.total ?? 0,
        hasMore: data?.data?.hasMore ?? false,
        rows: reset
          ? (data?.data?.rows ?? [])
          : [...prev.rows, ...(data?.data?.rows ?? [])],
      }));
    } catch {
      // Error loading students - handle silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    if (page > 1) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleEditStudent = (student: IStudent) => {
    setSelectedStudent(student);
    openEditModal();
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Group justify="space-between" align="flex-end">
            <div>
              <Title order={1} mb="xs">
                Students
              </Title>
              <Text c="dimmed" size="lg">
                Manage your student database
              </Text>
            </div>
            <Button
              leftSection={<IconUserPlus size={16} />}
              onClick={openAddModal}
            >
              Add Student
            </Button>
          </Group>
        </div>

        <Paper p="md" withBorder>
          <TextInput
            placeholder="Search by name, email, or phone"
            value={searchInput}
            onChange={e => {
              setSearchInput(e.currentTarget.value);
              setDebouncedSearch(e.currentTarget.value);
            }}
            leftSection={<IconSearch size={16} />}
            style={{ maxWidth: 400 }}
          />
        </Paper>

        <div>
          <Group justify="space-between" mb="md">
            <Text fw={500}>Total Students: {students.total}</Text>
          </Group>

          <Stack gap="md">
            {students.rows.map(student => (
              <Card key={student._id} withBorder padding="md">
                <Group justify="space-between" align="flex-start">
                  <div style={{ flex: 1 }}>
                    <Group gap="xs" mb={4}>
                      <IconUser size={16} />
                      <Text fw={500} size="lg">
                        <Anchor
                          component={Link}
                          href={`/students/${student._id}`}
                        >
                          {student.name}
                        </Anchor>
                      </Text>
                    </Group>
                    <Group gap="md" c="dimmed">
                      <Group gap={4}>
                        <IconMail size={14} />
                        <Text size="sm">{student.email}</Text>
                      </Group>
                      {student.phone && (
                        <Group gap={4}>
                          <IconPhone size={14} />
                          <Text size="sm">{student.phone}</Text>
                        </Group>
                      )}
                    </Group>
                    <Group gap="xs" mt="xs">
                      <Text size="sm" c="dimmed">
                        Fees: ₹{student.fees?.amount} for{' '}
                        {student.fees?.perClasses} sessions
                      </Text>
                    </Group>
                  </div>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => handleEditStudent(student)}
                      title="Edit student"
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <Badge variant="light" color="blue">
                      Active
                    </Badge>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>

          {students.hasMore && (
            <Group justify="center" mt="xl">
              <Button onClick={() => setPage(p => p + 1)} loading={loading}>
                Load more students
              </Button>
            </Group>
          )}

          {students.rows.length === 0 && !loading && (
            <Paper p="xl" withBorder>
              <Text ta="center" c="dimmed">
                {loading
                  ? 'Loading students...'
                  : `No students found. ${debouncedSearch ? 'Try adjusting your search criteria.' : 'Add your first student to get started.'}`}
              </Text>
            </Paper>
          )}

          {loading && students.rows.length === 0 && (
            <Paper p="xl" withBorder>
              <Text ta="center" c="dimmed">
                Loading students...
              </Text>
            </Paper>
          )}
        </div>
      </Stack>

      <AddStudentForm opened={addModalOpened} onClose={closeAddModal} />
      <EditStudentForm
        opened={editModalOpened}
        onClose={closeEditModal}
        student={selectedStudent}
      />
    </Container>
  );
}
