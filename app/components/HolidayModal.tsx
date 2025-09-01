'use client';

import { useState } from 'react';
import {
  Modal,
  Button,
  Group,
  Textarea,
  Stack,
  Text,
  Alert,
  Paper,
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconCalendar, IconPlus, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { IHoliday } from '@/types';
import { ConfirmationModal } from './ConfirmationModal';

interface HolidayModalProps {
  opened: boolean;
  onClose: () => void;
  onHolidayCreated: () => void;
}

export function HolidayModal({
  opened,
  onClose,
  onHolidayCreated,
}: HolidayModalProps) {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fromDate || !toDate) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please select both from and to dates',
        color: 'red',
      });
      return;
    }

    if (fromDate > toDate) {
      notifications.show({
        title: 'Validation Error',
        message: 'From date must be before or equal to to date',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/holiday', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
          description,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        notifications.show({
          title: 'Success',
          message: 'Holiday created successfully',
          color: 'green',
        });
        onHolidayCreated();
        handleClose();
      } else {
        notifications.show({
          title: 'Error',
          message: data.message || 'Failed to create holiday',
          color: 'red',
        });
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to create holiday',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFromDate(null);
    setToDate(null);
    setDescription('');
    setLoading(false);
    onClose();
  };

  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Schedule Holiday"
      size="md"
      centered
    >
      <Stack gap="md">
        <Alert color="blue" variant="light">
          <Text size="sm">
            Select a date range for the holiday. You can select the same date
            for both from and to dates for a single-day holiday. Any scheduled
            sessions during this period will be automatically canceled.
          </Text>
        </Alert>

        <DateInput
          label="From Date"
          placeholder="Select start date"
          value={fromDate}
          onChange={value => setFromDate(value ? new Date(value) : null)}
          minDate={getMinDate()}
          leftSection={<IconCalendar size={16} />}
          required
        />

        <DateInput
          label="To Date"
          placeholder="Select end date"
          value={toDate}
          onChange={value => setToDate(value ? new Date(value) : null)}
          minDate={fromDate || getMinDate()}
          leftSection={<IconCalendar size={16} />}
          required
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Enter holiday description..."
          value={description}
          onChange={e => setDescription(e.currentTarget.value)}
          rows={3}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            leftSection={<IconPlus size={16} />}
          >
            Create Holiday
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

interface HolidayListProps {
  holidays: IHoliday[];
  onHolidayDeleted: () => void;
}

export function HolidayList({ holidays, onHolidayDeleted }: HolidayListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<string | null>(null);

  const handleDelete = async (holidayId: string) => {
    setHolidayToDelete(holidayId);
    setDeleteModalOpened(true);
  };

  const confirmDelete = async () => {
    if (!holidayToDelete) {
      return;
    }

    setDeletingId(holidayToDelete);
    try {
      const response = await fetch(`/api/holiday/${holidayToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.ok) {
        notifications.show({
          title: 'Success',
          message: 'Holiday deleted successfully',
          color: 'green',
        });
        onHolidayDeleted();
      } else {
        notifications.show({
          title: 'Error',
          message: data.message || 'Failed to delete holiday',
          color: 'red',
        });
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete holiday',
        color: 'red',
      });
    } finally {
      setDeletingId(null);
      setHolidayToDelete(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateRange = (fromDate: Date, toDate: Date) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    // If dates are the same, show only one date
    if (from.toDateString() === to.toDateString()) {
      return formatDate(from);
    }

    // Otherwise show the range
    return `${formatDate(from)} - ${formatDate(to)}`;
  };

  if (holidays.length === 0) {
    return (
      <Paper p="md" withBorder>
        <Text c="dimmed" ta="center">
          No holidays scheduled
        </Text>
      </Paper>
    );
  }

  return (
    <>
      <Stack gap="sm">
        {holidays.map(holiday => (
          <Paper key={holiday._id} p="md" withBorder>
            <Group justify="space-between" align="flex-start">
              <div>
                <Group gap="xs" mb="xs">
                  <Text fw={500}>
                    {formatDateRange(holiday.fromDate, holiday.toDate)}
                  </Text>
                  <Badge color="red" variant="light">
                    Holiday
                  </Badge>
                </Group>
                {holiday.description && (
                  <Text size="sm" c="dimmed">
                    {holiday.description}
                  </Text>
                )}
              </div>
              <Tooltip label="Delete holiday">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => holiday._id && handleDelete(holiday._id)}
                  loading={deletingId === holiday._id}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Paper>
        ))}
      </Stack>

      <ConfirmationModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        onConfirm={confirmDelete}
        title="Delete Holiday"
        message="Are you sure you want to delete this holiday?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="red"
        loading={deletingId !== null}
      />
    </>
  );
}
