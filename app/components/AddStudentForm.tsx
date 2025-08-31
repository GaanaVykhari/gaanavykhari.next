'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  TextInput,
  NumberInput,
  Select,
  Button,
  Stack,
  Group,
  Text,
  MultiSelect,
} from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconUserPlus } from '@tabler/icons-react';

interface AddStudentFormProps {
  opened: boolean;
  onClose: () => void;
}

export default function AddStudentForm({
  opened,
  onClose,
}: AddStudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const response = await fetch('/api/student', {
        method: 'POST',
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
          message: 'Student added successfully',
          color: 'green',
        });
        form.reset();
        onClose();
        router.refresh();
      } else {
        throw new Error(data.message || 'Failed to add student');
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to add student',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add New Student"
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

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              leftSection={<IconUserPlus size={16} />}
            >
              Add Student
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
