'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  Select,
  TextInput,
  Badge,
  Alert,
  Card,
  ActionIcon,
  Divider,
  Loader,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconCalendar,
  IconClock,
  IconUser,
  IconEdit,
  IconTrash,
  IconPlus,
  IconAlertCircle,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { format } from 'date-fns';

interface Session {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  date: Date;
  time: string;
  status: 'scheduled' | 'attended' | 'canceled' | 'missed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SessionFormData {
  studentId: string;
  date: Date;
  time: string;
  notes?: string;
}

interface SessionManagerProps {
  studentId?: string;
  onSessionUpdated?: () => void;
}

export default function SessionManager({
  studentId,
  onSessionUpdated,
}: SessionManagerProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Modal states
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] =
    useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] =
    useDisclosure(false);

  const [formData, setFormData] = useState<SessionFormData>({
    studentId: studentId || '',
    date: new Date(),
    time: '09:00',
    notes: '',
  });

  // Load sessions
  const loadSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (studentId) params.set('studentId', studentId);
      params.set('limit', '50');

      const response = await fetch(`/api/sessions?${params.toString()}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (data.ok) {
        const sessionsWithDates = (data.data || []).map((session: any) => ({
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
        setSessions(sessionsWithDates);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load students for dropdown
  const loadStudents = async () => {
    try {
      const response = await fetch('/api/student/all?limit=1000', {
        cache: 'no-store',
      });
      const data = await response.json();
      if (data.ok) {
        setStudents(data.data.rows || []);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  useEffect(() => {
    loadSessions();
    if (!studentId) {
      loadStudents();
    }
  }, [studentId]);

  // Handle form submission
  const handleSubmit = async (isEdit: boolean = false) => {
    try {
      const url = isEdit
        ? `/api/sessions/${selectedSession?._id}`
        : '/api/sessions';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        closeAddModal();
        closeEditModal();
        resetForm();
        loadSessions();
        onSessionUpdated?.();
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  // Handle session status update
  const handleStatusUpdate = async (sessionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadSessions();
        onSessionUpdated?.();
      }
    } catch (error) {
      console.error('Failed to update session status:', error);
    }
  };

  // Handle delete session
  const handleDelete = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          loadSessions();
          onSessionUpdated?.();
        }
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: studentId || '',
      date: new Date(),
      time: '09:00',
      notes: '',
    });
    setSelectedSession(null);
  };

  // Open edit modal
  const handleOpenEditModal = (session: Session) => {
    setSelectedSession(session);
    setFormData({
      studentId: session.student._id,
      date: new Date(session.date),
      time: session.time,
      notes: session.notes || '',
    });
    openEditModal();
  };

  // Open view modal
  const handleOpenViewModal = (session: Session) => {
    setSelectedSession(session);
    openViewModal();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attended':
        return 'green';
      case 'canceled':
        return 'yellow';
      case 'missed':
        return 'red';
      case 'scheduled':
        return 'blue';
      default:
        return 'gray';
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
      case 'scheduled':
        return <IconClock size={16} />;
      default:
        return <IconClock size={16} />;
    }
  };

  const isPastSession = (date: Date) => {
    return new Date(date) < new Date();
  };

  return (
    <div>
      {/* Header with Add Button */}
      <Group justify="space-between" mb="md">
        <Text fw={500} size="lg">
          Sessions
        </Text>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={openAddModal}
          size="sm"
        >
          Add Session
        </Button>
      </Group>

      {/* Sessions List */}
      {loading ? (
        <Group justify="center" py="xl">
          <Loader size="sm" />
          <Text>Loading sessions...</Text>
        </Group>
      ) : (
        <Stack gap="md">
          {sessions.map(session => (
            <Card key={session._id} withBorder padding="md">
              <Group justify="space-between" align="flex-start">
                <div style={{ flex: 1 }}>
                  <Group gap="md" mb="xs">
                    <Group gap="xs">
                      <IconUser size={16} />
                      <Text fw={500} size="lg">
                        {session.student.name}
                      </Text>
                    </Group>
                    <Badge
                      color={getStatusColor(session.status)}
                      variant="light"
                      leftSection={getStatusIcon(session.status)}
                    >
                      {session.status.charAt(0).toUpperCase() +
                        session.status.slice(1)}
                    </Badge>
                    {isPastSession(session.date) &&
                      session.status === 'scheduled' && (
                        <Badge color="red" variant="filled">
                          Past Due
                        </Badge>
                      )}
                  </Group>

                  <Group c="dimmed">
                    <Group>
                      <IconCalendar size={14} />
                      <Text size="sm">
                        {format(new Date(session.date), 'MMM dd, yyyy')}
                      </Text>
                    </Group>
                    <Group>
                      <IconClock size={14} />
                      <Text size="sm">{session.time}</Text>
                    </Group>
                  </Group>

                  {session.notes && (
                    <Text size="sm" c="dimmed" mt="xs">
                      {session.notes}
                    </Text>
                  )}
                </div>

                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleOpenViewModal(session)}
                    title="View details"
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleOpenEditModal(session)}
                    title="Edit session"
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDelete(session._id)}
                    title="Delete session"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>

              {/* Quick Actions */}
              {session.status === 'scheduled' && (
                <>
                  <Divider my="sm" />
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="light"
                      color="green"
                      onClick={() =>
                        handleStatusUpdate(session._id, 'attended')
                      }
                    >
                      Mark Attended
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="yellow"
                      onClick={() =>
                        handleStatusUpdate(session._id, 'canceled')
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      onClick={() => handleStatusUpdate(session._id, 'missed')}
                    >
                      Mark Missed
                    </Button>
                  </Group>
                </>
              )}
            </Card>
          ))}

          {sessions.length === 0 && (
            <Card withBorder p="xl">
              <Stack align="center" gap="md">
                <IconCalendar size={48} color="var(--mantine-color-gray-5)" />
                <div style={{ textAlign: 'center' }}>
                  <Text fw={500} mb="xs">
                    No sessions found
                  </Text>
                  <Text c="dimmed" size="sm">
                    {studentId
                      ? 'This student has no scheduled sessions yet.'
                      : 'No sessions have been scheduled yet.'}
                  </Text>
                </div>
              </Stack>
            </Card>
          )}
        </Stack>
      )}

      {/* Add Session Modal */}
      <Modal
        opened={addModalOpened}
        onClose={closeAddModal}
        title="Add New Session"
        size="md"
      >
        <Stack gap="md">
          {!studentId && (
            <Select
              label="Student"
              placeholder="Select a student"
              data={students.map(s => ({ value: s._id, label: s.name }))}
              value={formData.studentId}
              onChange={value =>
                setFormData(prev => ({ ...prev, studentId: value || '' }))
              }
              required
            />
          )}
          <TextInput
            label="Date"
            placeholder="YYYY-MM-DD"
            type="date"
            value={formData.date.toISOString().split('T')[0]}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                date: new Date(e.currentTarget.value),
              }))
            }
            required
          />
          <TextInput
            label="Time"
            placeholder="HH:MM"
            type="time"
            value={formData.time}
            onChange={e =>
              setFormData(prev => ({ ...prev, time: e.currentTarget.value }))
            }
            required
          />
          <TextInput
            label="Notes (Optional)"
            placeholder="Add any notes about this session"
            value={formData.notes}
            onChange={e =>
              setFormData(prev => ({ ...prev, notes: e.currentTarget.value }))
            }
            required
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeAddModal}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit(false)}>Add Session</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Session Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="Edit Session"
        size="md"
      >
        <Stack gap="md">
          {!studentId && (
            <Select
              label="Student"
              placeholder="Select a student"
              data={students.map(s => ({ value: s._id, label: s.name }))}
              value={formData.studentId}
              onChange={value =>
                setFormData(prev => ({ ...prev, studentId: value || '' }))
              }
              required
            />
          )}
          <TextInput
            label="Date"
            placeholder="YYYY-MM-DD"
            type="date"
            value={formData.date.toISOString().split('T')[0]}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                date: new Date(e.currentTarget.value),
              }))
            }
            required
          />
          <TextInput
            label="Time"
            placeholder="HH:MM"
            type="time"
            value={formData.time}
            onChange={e =>
              setFormData(prev => ({ ...prev, time: e.currentTarget.value }))
            }
            required
          />
          <TextInput
            label="Notes (Optional)"
            placeholder="Add any notes about this session"
            value={formData.notes}
            onChange={e =>
              setFormData(prev => ({ ...prev, notes: e.currentTarget.value }))
            }
            required
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit(true)}>Update Session</Button>
          </Group>
        </Stack>
      </Modal>

      {/* View Session Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={closeViewModal}
        title="Session Details"
        size="md"
      >
        {selectedSession && (
          <Stack gap="md">
            <Group>
              <Text fw={500}>Student:</Text>
              <Text>{selectedSession.student.name}</Text>
            </Group>
            <Group>
              <Text fw={500}>Date:</Text>
              <Text>
                {format(new Date(selectedSession.date), 'MMM dd, yyyy')}
              </Text>
            </Group>
            <Group>
              <Text fw={500}>Time:</Text>
              <Text>{selectedSession.time}</Text>
            </Group>
            <Group>
              <Text fw={500}>Status:</Text>
              <Badge
                color={getStatusColor(selectedSession.status)}
                variant="light"
                leftSection={getStatusIcon(selectedSession.status)}
              >
                {selectedSession.status.charAt(0).toUpperCase() +
                  selectedSession.status.slice(1)}
              </Badge>
            </Group>
            {selectedSession.notes && (
              <Group>
                <Text fw={500}>Notes:</Text>
                <Text>{selectedSession.notes}</Text>
              </Group>
            )}
            <Group>
              <Text fw={500}>Created:</Text>
              <Text>
                {format(
                  new Date(selectedSession.createdAt),
                  'MMM dd, yyyy HH:mm'
                )}
              </Text>
            </Group>
            <Group>
              <Text fw={500}>Last Updated:</Text>
              <Text>
                {format(
                  new Date(selectedSession.updatedAt),
                  'MMM dd, yyyy HH:mm'
                )}
              </Text>
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  );
}
