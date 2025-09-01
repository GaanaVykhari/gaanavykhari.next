'use client';

import { useState, useEffect } from 'react';
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
  NumberInput,
  Select,
  Tabs,
  Alert,
  Divider,
  Badge,
  Card,
  Grid,
  Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSettings,
  IconBell,
  IconPalette,
  IconDatabase,
  IconDownload,
  IconAlertCircle,
  IconCheck,
  IconCurrencyRupee,
  IconCalendar,
  IconUsers,
  IconRefresh,
} from '@tabler/icons-react';

interface SystemSettings {
  general: {
    appName: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    paymentReminders: boolean;
    sessionReminders: boolean;
    newStudentAlerts: boolean;
    overduePaymentAlerts: boolean;
  };
  business: {
    defaultSessionDuration: number;
    defaultPaymentDueDays: number;
    autoGenerateSessions: boolean;
    allowSessionRescheduling: boolean;
    maxSessionsPerDay: number;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    sidebarCollapsed: boolean;
  };
}

interface SystemStats {
  totalStudents: number;
  totalSessions: number;
  totalPayments: number;
  totalRevenue: number;
  activeStudents: number;
  pendingPayments: number;
  overduePayments: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      appName: 'Gaanavykhari',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      currency: 'INR',
      language: 'en',
    },
    notifications: {
      emailNotifications: true,
      paymentReminders: true,
      sessionReminders: true,
      newStudentAlerts: false,
      overduePaymentAlerts: true,
    },
    business: {
      defaultSessionDuration: 60,
      defaultPaymentDueDays: 30,
      autoGenerateSessions: true,
      allowSessionRescheduling: true,
      maxSessionsPerDay: 20,
    },
    appearance: {
      theme: 'light',
      primaryColor: '#2563eb',
      sidebarCollapsed: false,
    },
  });

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [
    backupModalOpened,
    { open: openBackupModal, close: closeBackupModal },
  ] = useDisclosure(false);

  const loadSystemStats = async () => {
    setLoading(true);
    try {
      // This would typically fetch from an API endpoint
      // For now, we'll simulate the data
      setStats({
        totalStudents: 156,
        totalSessions: 1240,
        totalPayments: 890,
        totalRevenue: 450000,
        activeStudents: 142,
        pendingPayments: 23,
        overduePayments: 8,
      });
    } catch (error) {
      console.error('Failed to load system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemStats();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // This would typically save to an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      // Show success message
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBackupData = async () => {
    try {
      // This would typically trigger a backup process
      console.log('Backing up data...');
    } catch (error) {
      console.error('Failed to backup data:', error);
    }
  };

  const handleExportData = async () => {
    try {
      // This would typically export data to CSV/Excel
      console.log('Exporting data...');
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="xs">
            Settings
          </Title>
          <Text c="dimmed" size="lg">
            Configure your application preferences and system settings
          </Text>
        </div>

        {/* System Overview */}
        {stats && (
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder padding="md">
                <Group>
                  <IconUsers size={24} color="var(--mantine-color-blue-6)" />
                  <div>
                    <Text size="sm" c="dimmed">
                      Total Students
                    </Text>
                    <Text size="lg" fw={600}>
                      {stats.totalStudents}
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder padding="md">
                <Group>
                  <IconCalendar
                    size={24}
                    color="var(--mantine-color-green-6)"
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
                  <IconCurrencyRupee
                    size={24}
                    color="var(--mantine-color-orange-6)"
                  />
                  <div>
                    <Text size="sm" c="dimmed">
                      Total Revenue
                    </Text>
                    <Text size="lg" fw={600}>
                      ₹{stats.totalRevenue.toLocaleString()}
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder padding="md">
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
                      {stats.overduePayments}
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
          </Grid>
        )}

        <Tabs defaultValue="general">
          <Tabs.List>
            <Tabs.Tab value="general" leftSection={<IconSettings size={16} />}>
              General
            </Tabs.Tab>
            <Tabs.Tab
              value="notifications"
              leftSection={<IconBell size={16} />}
            >
              Notifications
            </Tabs.Tab>
            <Tabs.Tab
              value="business"
              leftSection={<IconCurrencyRupee size={16} />}
            >
              Business
            </Tabs.Tab>
            <Tabs.Tab
              value="appearance"
              leftSection={<IconPalette size={16} />}
            >
              Appearance
            </Tabs.Tab>
            <Tabs.Tab value="system" leftSection={<IconDatabase size={16} />}>
              System
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general" pt="md">
            <Paper p="md" withBorder>
              <Title order={3} mb="md">
                General Settings
              </Title>
              <Stack gap="md">
                <TextInput
                  label="Application Name"
                  placeholder="Gaanavykhari"
                  value={settings.general.appName}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      general: {
                        ...prev.general,
                        appName: e.currentTarget.value,
                      },
                    }))
                  }
                />
                <Select
                  label="Timezone"
                  placeholder="Select timezone"
                  value={settings.general.timezone}
                  onChange={value =>
                    setSettings(prev => ({
                      ...prev,
                      general: {
                        ...prev.general,
                        timezone: value || 'Asia/Kolkata',
                      },
                    }))
                  }
                  data={[
                    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
                    { value: 'UTC', label: 'UTC' },
                    {
                      value: 'America/New_York',
                      label: 'America/New_York (EST)',
                    },
                  ]}
                />
                <Select
                  label="Date Format"
                  placeholder="Select date format"
                  value={settings.general.dateFormat}
                  onChange={value =>
                    setSettings(prev => ({
                      ...prev,
                      general: {
                        ...prev.general,
                        dateFormat: value || 'DD/MM/YYYY',
                      },
                    }))
                  }
                  data={[
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                  ]}
                />
                <Select
                  label="Currency"
                  placeholder="Select currency"
                  value={settings.general.currency}
                  onChange={value =>
                    setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, currency: value || 'INR' },
                    }))
                  }
                  data={[
                    { value: 'INR', label: 'Indian Rupee (₹)' },
                    { value: 'USD', label: 'US Dollar ($)' },
                    { value: 'EUR', label: 'Euro (€)' },
                  ]}
                />
              </Stack>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="notifications" pt="md">
            <Paper p="md" withBorder>
              <Title order={3} mb="md">
                Notification Settings
              </Title>
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <div>
                    <Text fw={500}>Email Notifications</Text>
                    <Text size="sm" c="dimmed">
                      Receive email alerts for important events
                    </Text>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          emailNotifications: e.currentTarget.checked,
                        },
                      }))
                    }
                  />
                </Group>

                <Group justify="space-between" align="center">
                  <div>
                    <Text fw={500}>Payment Reminders</Text>
                    <Text size="sm" c="dimmed">
                      Get notified about pending payments
                    </Text>
                  </div>
                  <Switch
                    checked={settings.notifications.paymentReminders}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          paymentReminders: e.currentTarget.checked,
                        },
                      }))
                    }
                  />
                </Group>

                <Group justify="space-between" align="center">
                  <div>
                    <Text fw={500}>Session Reminders</Text>
                    <Text size="sm" c="dimmed">
                      Get notified about upcoming sessions
                    </Text>
                  </div>
                  <Switch
                    checked={settings.notifications.sessionReminders}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          sessionReminders: e.currentTarget.checked,
                        },
                      }))
                    }
                  />
                </Group>

                <Group justify="space-between" align="center">
                  <div>
                    <Text fw={500}>New Student Alerts</Text>
                    <Text size="sm" c="dimmed">
                      Notifications when new students are added
                    </Text>
                  </div>
                  <Switch
                    checked={settings.notifications.newStudentAlerts}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          newStudentAlerts: e.currentTarget.checked,
                        },
                      }))
                    }
                  />
                </Group>

                <Group justify="space-between" align="center">
                  <div>
                    <Text fw={500}>Overdue Payment Alerts</Text>
                    <Text size="sm" c="dimmed">
                      Get notified about overdue payments
                    </Text>
                  </div>
                  <Switch
                    checked={settings.notifications.overduePaymentAlerts}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          overduePaymentAlerts: e.currentTarget.checked,
                        },
                      }))
                    }
                  />
                </Group>
              </Stack>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="business" pt="md">
            <Paper p="md" withBorder>
              <Title order={3} mb="md">
                Business Settings
              </Title>
              <Stack gap="md">
                <NumberInput
                  label="Default Session Duration (minutes)"
                  placeholder="60"
                  value={settings.business.defaultSessionDuration}
                  onChange={value =>
                    setSettings(prev => ({
                      ...prev,
                      business: {
                        ...prev.business,
                        defaultSessionDuration: Number(value) || 60,
                      },
                    }))
                  }
                  min={15}
                  max={180}
                />
                <NumberInput
                  label="Default Payment Due Days"
                  placeholder="30"
                  value={settings.business.defaultPaymentDueDays}
                  onChange={value =>
                    setSettings(prev => ({
                      ...prev,
                      business: {
                        ...prev.business,
                        defaultPaymentDueDays: Number(value) || 30,
                      },
                    }))
                  }
                  min={1}
                  max={365}
                />
                <NumberInput
                  label="Maximum Sessions Per Day"
                  placeholder="20"
                  value={settings.business.maxSessionsPerDay}
                  onChange={value =>
                    setSettings(prev => ({
                      ...prev,
                      business: {
                        ...prev.business,
                        maxSessionsPerDay: Number(value) || 20,
                      },
                    }))
                  }
                  min={1}
                  max={100}
                />
                <Group justify="space-between" align="center">
                  <div>
                    <Text fw={500}>Auto Generate Sessions</Text>
                    <Text size="sm" c="dimmed">
                      Automatically generate recurring sessions
                    </Text>
                  </div>
                  <Switch
                    checked={settings.business.autoGenerateSessions}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        business: {
                          ...prev.business,
                          autoGenerateSessions: e.currentTarget.checked,
                        },
                      }))
                    }
                  />
                </Group>
                <Group justify="space-between" align="center">
                  <div>
                    <Text fw={500}>Allow Session Rescheduling</Text>
                    <Text size="sm" c="dimmed">
                      Allow students to reschedule their sessions
                    </Text>
                  </div>
                  <Switch
                    checked={settings.business.allowSessionRescheduling}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        business: {
                          ...prev.business,
                          allowSessionRescheduling: e.currentTarget.checked,
                        },
                      }))
                    }
                  />
                </Group>
              </Stack>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="appearance" pt="md">
            <Paper p="md" withBorder>
              <Title order={3} mb="md">
                Appearance Settings
              </Title>
              <Stack gap="md">
                <Select
                  label="Theme"
                  placeholder="Select theme"
                  value={settings.appearance.theme}
                  onChange={value =>
                    setSettings(prev => ({
                      ...prev,
                      appearance: {
                        ...prev.appearance,
                        theme: (value as 'light' | 'dark' | 'auto') || 'light',
                      },
                    }))
                  }
                  data={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'auto', label: 'Auto (System)' },
                  ]}
                />
                <TextInput
                  label="Primary Color"
                  placeholder="#2563eb"
                  value={settings.appearance.primaryColor}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      appearance: {
                        ...prev.appearance,
                        primaryColor: e.currentTarget.value,
                      },
                    }))
                  }
                />
                <Group justify="space-between" align="center">
                  <div>
                    <Text fw={500}>Collapsed Sidebar</Text>
                    <Text size="sm" c="dimmed">
                      Start with sidebar collapsed
                    </Text>
                  </div>
                  <Switch
                    checked={settings.appearance.sidebarCollapsed}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          sidebarCollapsed: e.currentTarget.checked,
                        },
                      }))
                    }
                  />
                </Group>
              </Stack>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="system" pt="md">
            <Paper p="md" withBorder>
              <Title order={3} mb="md">
                System Management
              </Title>
              <Stack gap="md">
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Data Management"
                  color="blue"
                >
                  Manage your application data, backups, and system maintenance.
                </Alert>

                <Group>
                  <Button
                    leftSection={<IconDatabase size={16} />}
                    onClick={openBackupModal}
                    variant="light"
                  >
                    Backup Data
                  </Button>
                  <Button
                    leftSection={<IconDownload size={16} />}
                    onClick={handleExportData}
                    variant="light"
                  >
                    Export Data
                  </Button>
                  <Button
                    leftSection={<IconRefresh size={16} />}
                    onClick={loadSystemStats}
                    variant="light"
                    loading={loading}
                  >
                    Refresh Stats
                  </Button>
                </Group>

                <Divider />

                <div>
                  <Text fw={500} mb="sm">
                    System Information
                  </Text>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Application Version
                      </Text>
                      <Badge variant="light">v1.0.0</Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Database Status
                      </Text>
                      <Badge variant="light" color="green">
                        Connected
                      </Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Last Backup
                      </Text>
                      <Text size="sm">Never</Text>
                    </Group>
                  </Stack>
                </div>
              </Stack>
            </Paper>
          </Tabs.Panel>
        </Tabs>

        {/* Save Button */}
        <Group justify="flex-end">
          <Button
            onClick={handleSaveSettings}
            loading={saving}
            leftSection={<IconCheck size={16} />}
          >
            Save Settings
          </Button>
        </Group>
      </Stack>

      {/* Backup Modal */}
      <Modal
        opened={backupModalOpened}
        onClose={closeBackupModal}
        title="Backup Data"
        size="md"
      >
        <Stack gap="md">
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Important"
            color="yellow"
          >
            This will create a complete backup of all your data including
            students, sessions, and payments.
          </Alert>
          <Text size="sm" c="dimmed">
            The backup will be downloaded as a JSON file that you can use to
            restore your data if needed.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeBackupModal}>
              Cancel
            </Button>
            <Button
              onClick={handleBackupData}
              leftSection={<IconDownload size={16} />}
            >
              Create Backup
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
