'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from 'mantine-datatable';
import { IconEdit, IconTrash, IconSearch, IconX } from '@tabler/icons-react';
import { Group, ActionIcon, Paper, Text, Stack, TextInput, MultiSelect } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { EmployeePicture } from '../../../../components/Employees/EmployeePicture';
import { TableHeader } from './TableHeader/TableHeader';
import { AddEmployeeModal } from './AddEmployeeModal/AddEmployeeModal';
import { EmployeeType, ShowModalParams } from './types';

export default function EmployeesPage() {
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchTenantId() {
      const user = await supabase.auth.getUser();
      if (user.data.user?.user_metadata.tenantId) {
        setTenantId(user.data.user.user_metadata.tenantId);
      }
    }

    fetchTenantId();
  }, [supabase]);

  const getEmployeesQuery = useQuery<EmployeeType[]>({
    queryKey: ['employees', tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/${tenantId}/employees`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: EmployeeType[] = await response.json();
      return data.map((employee) => ({
        ...employee,
        car: employee.Car?.regnr || 'No Car',
      }));
    },
    enabled: !!tenantId,
  });

  const queryClient = useQueryClient();

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: number) => {
      await fetch(`/api/${tenantId}/employees/${employeeId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      // Optionally: Show success notification here
      queryClient.invalidateQueries({
        queryKey: ['employees'],
      });
    },
    onError: (error) => {
      // Optionally: Show error notification here
      console.error('Error deleting employee:', error);
    },
  });

  const handleDelete = (employeeId: number) => {
    // Confirm before deleting
    if (
      window.confirm('Er du sikker på at du vil slette denne ansatte? Handlingen kan ikke angres.')
    ) {
      deleteEmployeeMutation.mutate(employeeId);
    }
  };

  const initialRecords = getEmployeesQuery.data ?? [];

  const [records, setRecords] = useState(initialRecords);
  const [nameQuery, setNameQuery] = useState('');
  const [regnrQuery, setRegnrQuery] = useState('');
  const [debouncedNameQuery] = useDebouncedValue(nameQuery, 200);
  const [debouncedRegnrQuery] = useDebouncedValue(regnrQuery, 200);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

  useEffect(() => {
    setRecords(getEmployeesQuery.data ?? []);
  }, [getEmployeesQuery.data]);

  useEffect(() => {
    setRecords(
      initialRecords?.filter(({ name, Car, status }) => {
        if (
          debouncedNameQuery !== '' &&
          !`${name}`.toLowerCase().includes(debouncedNameQuery.trim().toLowerCase())
        ) {
          return false;
        }

        if (
          debouncedRegnrQuery !== '' &&
          (Car == null ||
            !`${Car.regnr}`.toLowerCase().includes(debouncedRegnrQuery.trim().toLowerCase()))
        ) {
          return false;
        }

        if (selectedStatus.length && !selectedStatus.some((d) => d === status)) return false;

        return true;
      })
    );
  }, [debouncedNameQuery, debouncedRegnrQuery, selectedStatus]);

  const showModal = ({ employee, action }: ShowModalParams) => {
    console.log(`Showing ${action} modal for employee`, employee);
  };

  const openCreateModal = () => {
    setAddModalOpened(true);
  };

  const userCount = records.length || 0;

  if (getEmployeesQuery.error) return <Text>Error...</Text>;
  if (getEmployeesQuery.isLoading) return <Text>Loading...</Text>;

  return (
    <Paper style={{ overflow: 'hidden', borderRadius: '8px' }} m="0" pb="md" pt="xs">
      <TableHeader userCount={userCount} onClick={() => openCreateModal()} />
      <DataTable
        borderRadius="md"
        withTableBorder
        withColumnBorders
        pinFirstColumn
        striped
        highlightOnHover
        records={records}
        columns={[
          {
            accessor: 'name',
            title: 'Navn',
            render: (employee: EmployeeType) => (
              <Group>
                <EmployeePicture imageSrc={employee.picture} />
                <Stack align="flex-start" gap="xs">
                  <Text fw={700}>{employee.name}</Text>
                  <Text c="dimmed" size="xs" style={{ marginTop: '-13px' }}>
                    {employee.email}
                  </Text>
                </Stack>
              </Group>
            ),
            filter: (
              <TextInput
                label="Ansatte"
                description="Vis ansatte som har det spesifiserte navnet"
                placeholder="Søk etter ansatte..."
                leftSection={<IconSearch size={16} />}
                rightSection={
                  <ActionIcon
                    size="sm"
                    variant="transparent"
                    c="dimmed"
                    onClick={() => setNameQuery('')}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                }
                value={nameQuery}
                onChange={(e) => setNameQuery(e.currentTarget.value)}
              />
            ),
            filtering: nameQuery !== '',
          },
          { accessor: 'phone', title: 'Telefon' },
          {
            accessor: 'status',
            title: 'Status',
            render: (employee) => employee.status,
            filter: (
              <MultiSelect
                label="Status"
                placeholder="Filtrer etter status"
                data={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
            ),
            filtering: selectedStatus.length > 0,
          },
          {
            accessor: 'car',
            title: 'Bil',
            render: (employee) => employee.Car?.regnr || 'Ingen bil',
            filter: (
              <TextInput
                label="Bil"
                description="Vis ansatte basert på regnr"
                placeholder="Søk etter bil..."
                leftSection={<IconSearch size={16} />}
                rightSection={
                  <ActionIcon
                    size="sm"
                    variant="transparent"
                    color="dimmed"
                    onClick={() => setRegnrQuery('')}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                }
                value={regnrQuery}
                onChange={(e) => setRegnrQuery(e.currentTarget.value)}
              />
            ),
            filtering: regnrQuery !== '',
          },
          {
            accessor: 'actions',
            title: 'Rediger/slett',
            textAlign: 'right',
            render: (employee: EmployeeType) => (
              <Group gap={4} justify="right" wrap="nowrap">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="blue"
                  onClick={() => showModal({ employee, action: 'edit' })}
                >
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={() => handleDelete(employee.id)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
      />
      <AddEmployeeModal
        opened={addModalOpened}
        tenantId={tenantId}
        onClose={() => setAddModalOpened(false)}
        onEmployeeAdded={getEmployeesQuery.refetch}
      />
    </Paper>
  );
}
