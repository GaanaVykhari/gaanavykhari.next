'use client';

import {
  Container,
  Stack,
  Title,
  Text,
  Paper,
  Group,
  Switch,
  TextInput,
  Button,
  Divider,
} from '@mantine/core';
import {
  IconSettings,
  IconBell,
  IconShield,
  IconPalette,
} from '@tabler/icons-react';

export default function SettingsPage() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="xs">
            Settings
          </Title>
          <Text c="dimmed" size="lg">
            Configure your application preferences
          </Text>
        </div>

        <Paper p="md" withBorder>
          <Group gap="xs" mb="md">
            <IconSettings size={20} />
            <Text fw={500} size="lg">
              General Settings
            </Text>
          </Group>

          <Stack gap="md">
            <Group justify="space-between" align="center">
              <div>
                <Text fw={500}>Dark Mode</Text>
                <Text size="sm" c="dimmed">
                  Switch between light and dark themes
                </Text>
              </div>
              <Switch />
            </Group>

            <Group justify="space-between" align="center">
              <div>
                <Text fw={500}>Email Notifications</Text>
                <Text size="sm" c="dimmed">
                  Receive email alerts for important events
                </Text>
              </div>
              <Switch defaultChecked />
            </Group>
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Group gap="xs" mb="md">
            <IconBell size={20} />
            <Text fw={500} size="lg">
              Notifications
            </Text>
          </Group>

          <Stack gap="md">
            <Group justify="space-between" align="center">
              <div>
                <Text fw={500}>Payment Reminders</Text>
                <Text size="sm" c="dimmed">
                  Get notified about pending payments
                </Text>
              </div>
              <Switch defaultChecked />
            </Group>

            <Group justify="space-between" align="center">
              <div>
                <Text fw={500}>New Student Alerts</Text>
                <Text size="sm" c="dimmed">
                  Notifications when new students are added
                </Text>
              </div>
              <Switch />
            </Group>
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Group gap="xs" mb="md">
            <IconShield size={20} />
            <Text fw={500} size="lg">
              Security
            </Text>
          </Group>

          <Stack gap="md">
            <TextInput
              label="Current Password"
              type="password"
              placeholder="Enter current password"
            />
            <TextInput
              label="New Password"
              type="password"
              placeholder="Enter new password"
            />
            <TextInput
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
            />
            <Button>Update Password</Button>
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Group gap="xs" mb="md">
            <IconPalette size={20} />
            <Text fw={500} size="lg">
              Appearance
            </Text>
          </Group>

          <Stack gap="md">
            <TextInput
              label="Application Name"
              placeholder="Gaanavykhari"
              defaultValue="Gaanavykhari"
            />
            <TextInput
              label="Primary Color"
              placeholder="#2563eb"
              defaultValue="#2563eb"
            />
            <Button>Save Changes</Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
