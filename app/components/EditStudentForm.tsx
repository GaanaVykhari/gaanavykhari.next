'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  TextInput,
  NumberInput,
  Select,
  Button,
  Stack,
  Group,
  MultiSelect,
  ActionIcon,
  Text,
} from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { IStudent } from '@/types';

interface EditStudentFormProps {
  opened: boolean;
  onClose: () => void;
  student: IStudent | null;
}

export default function EditStudentForm({
  opened,
  onClose,
  student,
}: EditStudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      fees: {
        perClasses: 1,
        amount: 0,
      },
      schedule: {
        frequency: 'weekly' as 'weekly' | 'daily' | 'fortnightly' | 'monthly',
        daysOfTheWeek: [] as string[],
        daysOfTheMonth: [] as string[],
        time: '09:00',
      },
      inductionDate: new Date(),
    },
    validate: {
      name: value =>
        value.length < 2 ? 'Name must be at least 2 characters' : null,
      email: value => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      phone: value =>
        value.length < 10 ? 'Phone must be at least 10 digits' : null,
      fees: {
        amount: (value: number) =>
          value <= 0 ? 'Amount must be greater than 0' : null,
        perClasses: (value: number) =>
          value <= 0 ? 'Number of classes must be greater than 0' : null,
      },
    },
  });

  useEffect(() => {
    if (student && opened) {
      form.setValues({
        name: student.name,
        email: student.email,
        phone: student.phone,
        fees: student.fees,
        schedule: {
          frequency: student.schedule.frequency,
          daysOfTheWeek: student.schedule.daysOfTheWeek.map(String),
          daysOfTheMonth: student.schedule.daysOfTheMonth.map(String),
          time: student.schedule.time,
        },
        inductionDate: new Date(student.inductionDate),
      });
    }
  }, [student, opened]);

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'fortnightly', label: 'Fortnightly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const dayOptions = [
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
  ];

  const monthDayOptions = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

  const handleSubmit = async (values: typeof form.values) => {
    if (!student?._id) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/student/${student._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          schedule: {
            ...values.schedule,
            daysOfTheWeek: values.schedule.daysOfTheWeek.map(Number),
            daysOfTheMonth: values.schedule.daysOfTheMonth.map(Number),
          },
        }),
      });

      const data = await response.json();

      if (data.ok || response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Student updated successfully',
          color: 'green',
        });
        onClose();
        router.refresh();
      } else {
        throw new Error(data.message || 'Failed to update student');
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update student',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!student?._id) {
      return;
    }

    if (
      !confirm(
        'Are you sure you want to delete this student? This action cannot be undone.'
      )
    ) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/student/${student._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.ok || response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Student deleted successfully',
          color: 'green',
        });
        onClose();
        router.push('/students');
      } else {
        throw new Error(data.message || 'Failed to delete student');
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to delete student',
        color: 'red',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Student"
      size="lg"
      closeOnClickOutside={false}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Full Name"
            placeholder="Enter student's full name"
            required
            {...form.getInputProps('name')}
          />

          <TextInput
            label="Email"
            placeholder="Enter student's email"
            required
            {...form.getInputProps('email')}
          />

          <TextInput
            label="Phone Number"
            placeholder="Enter student's phone number"
            required
            {...form.getInputProps('phone')}
          />

          <Group grow>
            <NumberInput
              label="Number of Classes"
              placeholder="Number of classes"
              min={1}
              required
              {...form.getInputProps('fees.perClasses')}
            />
            <NumberInput
              label="Fee Amount (₹)"
              placeholder="Fee amount"
              min={0}
              required
              {...form.getInputProps('fees.amount')}
            />
          </Group>

          <DateInput
            label="Induction Date"
            placeholder="Select induction date"
            required
            styles={{
              input: {
                fontSize: 'var(--mantine-font-size-sm)',
              },
            }}
            {...form.getInputProps('inductionDate')}
          />

          <Select
            label="Schedule Frequency"
            placeholder="Select frequency"
            data={frequencyOptions}
            required
            {...form.getInputProps('schedule.frequency')}
          />

          {form.values.schedule.frequency === 'weekly' && (
            <MultiSelect
              label="Days of the Week"
              placeholder="Select days"
              data={dayOptions}
              required
              {...form.getInputProps('schedule.daysOfTheWeek')}
            />
          )}

          {form.values.schedule.frequency === 'monthly' && (
            <MultiSelect
              label="Days of the Month"
              placeholder="Select days"
              data={monthDayOptions}
              required
              {...form.getInputProps('schedule.daysOfTheMonth')}
            />
          )}

          <TimeInput
            label="Class Time"
            placeholder="Select time"
            required
            {...form.getInputProps('schedule.time')}
          />

          <Group justify="space-between" mt="md">
            <ActionIcon
              variant="subtle"
              color="red"
              size="lg"
              onClick={handleDelete}
              loading={deleteLoading}
              title="Delete student"
            >
              <IconTrash size={20} />
            </ActionIcon>

            <Group>
              <Button variant="subtle" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                leftSection={<IconEdit size={16} />}
              >
                Update Student
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
