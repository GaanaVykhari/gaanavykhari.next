'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Title,
  Container,
  Stack,
  Group,
  Paper,
  Text,
  Badge,
  Card,
  Button,
  TextInput,
  Select,
  Modal,
  NumberInput,
  ActionIcon,
  Loader,
  Pagination,
  Grid,
  Divider,
} from '@mantine/core';
import { useDisclosure, useDebouncedState } from '@mantine/hooks';
import {
  IconUser,
  IconCalendar,
  IconCurrencyRupee,
  IconPlus,
  IconSearch,
  IconFilter,
  IconEdit,
  IconTrash,
  IconEye,
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconX,
} from '@tabler/icons-react';
import { format } from 'date-fns';

interface Payment {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  amount: number;
  dueDate: Date;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  paymentDate?: Date;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentFormData {
  studentId: string;
  amount: number;
  dueDate: Date;
  notes?: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useDebouncedState('', 300);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);

  // Modal states
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] =
    useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] =
    useDisclosure(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    studentId: '',
    amount: 0,
    dueDate: new Date(),
    notes: '',
  });

  // Load payments
  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', '20');
      if (searchTerm) params.set('search', searchTerm);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/payments?${params.toString()}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (data.ok) {
        setPayments(data.data.payments || []);
        setTotalPages(data.data.totalPages || 1);
        setTotalPayments(data.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  // Load students for dropdown
  const loadStudents = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Handle form submission
  const handleSubmit = async (isEdit: boolean = false) => {
    try {
      const url = isEdit
        ? `/api/payments/${selectedPayment?._id}`
        : '/api/payments';
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
        loadPayments();
      }
    } catch (error) {
      console.error('Failed to save payment:', error);
    }
  };

  // Handle payment status update
  const handleStatusUpdate = async (paymentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadPayments();
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  };

  // Handle delete payment
  const handleDelete = async (paymentId: string) => {
    if (confirm('Are you sure you want to delete this payment?')) {
      try {
        const response = await fetch(`/api/payments/${paymentId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          loadPayments();
        }
      } catch (error) {
        console.error('Failed to delete payment:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      amount: 0,
      dueDate: new Date(),
      notes: '',
    });
    setSelectedPayment(null);
  };

  const handleEditModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setFormData({
      studentId: payment.student._id,
      amount: payment.amount,
      dueDate: new Date(payment.dueDate),
      notes: payment.notes || '',
    });
    openEditModal();
  };

  const handleViewModal = (payment: Payment) => {
    setSelectedPayment(payment);
    openViewModal();
  };

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

  const isOverdue = (dueDate: Date) => {
    return new Date(dueDate) < new Date() && statusFilter !== 'paid';
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Group justify="space-between" align="flex-end">
            <div>
              <Title order={1} mb="xs">
                Payments
              </Title>
              <Text c="dimmed" size="lg">
                Track and manage payment records
              </Text>
            </div>
            <Button leftSection={<IconPlus size={16} />} onClick={openAddModal}>
              Add Payment
            </Button>
          </Group>
        </div>

        {/* Stats Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" withBorder>
              <Group>
                <IconCurrencyRupee
                  size={24}
                  color="var(--mantine-color-blue-6)"
                />
                <div>
                  <Text size="sm" c="dimmed">
                    Total Payments
                  </Text>
                  <Text size="lg" fw={600}>
                    {totalPayments}
                  </Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" withBorder>
              <Group>
                <IconCheck size={24} color="var(--mantine-color-green-6)" />
                <div>
                  <Text size="sm" c="dimmed">
                    Paid
                  </Text>
                  <Text size="lg" fw={600}>
                    {payments.filter(p => p.status === 'paid').length}
                  </Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" withBorder>
              <Group>
                <IconClock size={24} color="var(--mantine-color-yellow-6)" />
                <div>
                  <Text size="sm" c="dimmed">
                    Pending
                  </Text>
                  <Text size="lg" fw={600}>
                    {payments.filter(p => p.status === 'pending').length}
                  </Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" withBorder>
              <Group>
                <IconAlertCircle size={24} color="var(--mantine-color-red-6)" />
                <div>
                  <Text size="sm" c="dimmed">
                    Overdue
                  </Text>
                  <Text size="lg" fw={600}>
                    {payments.filter(p => isOverdue(p.dueDate)).length}
                  </Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Filters */}
        <Paper p="md" withBorder>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <TextInput
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={value => setStatusFilter(value || 'all')}
                data={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'overdue', label: 'Overdue' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                leftSection={<IconFilter size={16} />}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Payments List */}
        <div>
          <Group justify="space-between" mb="md">
            <Text fw={500}>Payments ({totalPayments})</Text>
          </Group>

          {loading ? (
            <Paper p="xl" withBorder>
              <Group justify="center">
                <Loader size="sm" />
                <Text>Loading payments...</Text>
              </Group>
            </Paper>
          ) : (
            <>
              <Stack gap="md">
                {payments.map(payment => (
                  <Card key={payment._id} withBorder padding="md">
                    <Group justify="space-between" align="flex-start">
                      <div style={{ flex: 1 }}>
                        <Group gap="md" mb="xs">
                          <Group gap="xs">
                            <IconUser size={16} />
                            <Text fw={500} size="lg">
                              {payment.student.name}
                            </Text>
                          </Group>
                          <Badge
                            color={getStatusColor(payment.status)}
                            variant="light"
                            leftSection={getStatusIcon(payment.status)}
                          >
                            {payment.status.charAt(0).toUpperCase() +
                              payment.status.slice(1)}
                          </Badge>
                          {isOverdue(payment.dueDate) && (
                            <Badge color="red" variant="filled">
                              Overdue
                            </Badge>
                          )}
                        </Group>

                        <Group gap="md" c="dimmed">
                          <Group gap={4}>
                            <IconCurrencyRupee size={14} />
                            <Text size="sm">₹{payment.amount}</Text>
                          </Group>
                          <Group gap={4}>
                            <IconCalendar size={14} />
                            <Text size="sm">
                              Due:{' '}
                              {format(
                                new Date(payment.dueDate),
                                'MMM dd, yyyy'
                              )}
                            </Text>
                          </Group>
                          {payment.paymentDate && (
                            <Group gap={4}>
                              <IconCheck size={14} />
                              <Text size="sm">
                                Paid:{' '}
                                {format(
                                  new Date(payment.paymentDate),
                                  'MMM dd, yyyy'
                                )}
                              </Text>
                            </Group>
                          )}
                        </Group>

                        {payment.notes && (
                          <Text size="sm" c="dimmed" mt="xs">
                            {payment.notes}
                          </Text>
                        )}
                      </div>

                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleViewModal(payment)}
                          title="View details"
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleEditModal(payment)}
                          title="Edit payment"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDelete(payment._id)}
                          title="Delete payment"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>

                    {/* Quick Actions */}
                    {payment.status === 'pending' && (
                      <>
                        <Divider my="sm" />
                        <Group gap="xs">
                          <Button
                            size="xs"
                            variant="light"
                            color="green"
                            onClick={() =>
                              handleStatusUpdate(payment._id, 'paid')
                            }
                          >
                            Mark as Paid
                          </Button>
                          <Button
                            size="xs"
                            variant="light"
                            color="red"
                            onClick={() =>
                              handleStatusUpdate(payment._id, 'cancelled')
                            }
                          >
                            Cancel
                          </Button>
                        </Group>
                      </>
                    )}
                  </Card>
                ))}
              </Stack>

              {payments.length === 0 && (
                <Paper p="xl" withBorder>
                  <Text ta="center" c="dimmed">
                    No payments found matching your criteria.
                  </Text>
                </Paper>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Group justify="center" mt="xl">
                  <Pagination
                    total={totalPages}
                    value={currentPage}
                    onChange={setCurrentPage}
                  />
                </Group>
              )}
            </>
          )}
        </div>
      </Stack>

      {/* Add Payment Modal */}
      <Modal
        opened={addModalOpened}
        onClose={closeAddModal}
        title="Add New Payment"
        size="md"
      >
        <Stack gap="md">
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
          <NumberInput
            label="Amount (₹)"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={value =>
              setFormData(prev => ({ ...prev, amount: Number(value) || 0 }))
            }
            min={0}
            required
          />
          <TextInput
            label="Due Date"
            placeholder="YYYY-MM-DD"
            type="date"
            value={formData.dueDate.toISOString().split('T')[0]}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                dueDate: new Date(e.currentTarget.value),
              }))
            }
            required
          />
          <TextInput
            label="Notes (Optional)"
            placeholder="Add any notes about this payment"
            value={formData.notes}
            onChange={e =>
              setFormData(prev => ({ ...prev, notes: e.currentTarget.value }))
            }
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeAddModal}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit(false)}>Add Payment</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Payment Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="Edit Payment"
        size="md"
      >
        <Stack gap="md">
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
          <NumberInput
            label="Amount (₹)"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={value =>
              setFormData(prev => ({ ...prev, amount: Number(value) || 0 }))
            }
            min={0}
            required
          />
          <TextInput
            label="Due Date"
            placeholder="YYYY-MM-DD"
            type="date"
            value={formData.dueDate.toISOString().split('T')[0]}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                dueDate: new Date(e.currentTarget.value),
              }))
            }
            required
          />
          <TextInput
            label="Notes (Optional)"
            placeholder="Add any notes about this payment"
            value={formData.notes}
            onChange={e =>
              setFormData(prev => ({ ...prev, notes: e.currentTarget.value }))
            }
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit(true)}>Update Payment</Button>
          </Group>
        </Stack>
      </Modal>

      {/* View Payment Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={closeViewModal}
        title="Payment Details"
        size="md"
      >
        {selectedPayment ? (
          <Stack gap="md">
            <Group>
              <Text fw={500}>Student:</Text>
              <Text>{selectedPayment.student.name}</Text>
            </Group>
            <Group>
              <Text fw={500}>Amount:</Text>
              <Text>₹{selectedPayment.amount}</Text>
            </Group>
            <Group>
              <Text fw={500}>Status:</Text>
              <Badge
                color={getStatusColor(selectedPayment.status)}
                variant="light"
                leftSection={getStatusIcon(selectedPayment.status)}
              >
                {selectedPayment.status.charAt(0).toUpperCase() +
                  selectedPayment.status.slice(1)}
              </Badge>
            </Group>
            <Group>
              <Text fw={500}>Due Date:</Text>
              <Text>
                {format(new Date(selectedPayment.dueDate), 'MMM dd, yyyy')}
              </Text>
            </Group>
            {selectedPayment.paymentDate && (
              <Group>
                <Text fw={500}>Payment Date:</Text>
                <Text>
                  {format(
                    new Date(selectedPayment.paymentDate),
                    'MMM dd, yyyy'
                  )}
                </Text>
              </Group>
            )}
            {selectedPayment.notes && (
              <Group>
                <Text fw={500}>Notes:</Text>
                <Text>{selectedPayment.notes}</Text>
              </Group>
            )}
            <Group>
              <Text fw={500}>Created:</Text>
              <Text>
                {format(
                  new Date(selectedPayment.createdAt),
                  'MMM dd, yyyy HH:mm'
                )}
              </Text>
            </Group>
            <Group>
              <Text fw={500}>Last Updated:</Text>
              <Text>
                {format(
                  new Date(selectedPayment.updatedAt),
                  'MMM dd, yyyy HH:mm'
                )}
              </Text>
            </Group>
          </Stack>
        ) : null}
      </Modal>
    </Container>
  );
}
