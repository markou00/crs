'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { IconEdit, IconTrash, IconSearch, IconX } from '@tabler/icons-react';
import { Group, ActionIcon, Paper, Text, TextInput, MultiSelect } from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TableHeader } from './TableHeader/TableHeader';
import { AddCarModal } from './AddCarModal/AddCarModal';
import { EditCarDrawer } from './EditCarDrawer/EditCarDrawer';
import { CarType } from './types';

export default function CarsPage() {
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const supabase = createClientComponentClient();
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    async function fetchTenantId() {
      const user = await supabase.auth.getUser();
      if (user.data.user?.user_metadata.tenantId) {
        setTenantId(user.data.user.user_metadata.tenantId);
      }
    }

    fetchTenantId();
  }, [supabase]);

  const getCarsQuery = useQuery<CarType[]>({
    queryKey: ['cars', tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/${tenantId}/trucks`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: CarType[] = await response.json();
      return data.map((car) => ({
        ...car,
        employee: car.Employee?.name || 'Ingen sjåfør',
      }));
    },
    enabled: !!tenantId,
  });

  const queryClient = useQueryClient();

  const deleteCarMutation = useMutation({
    mutationFn: async (carId: string) => {
      await fetch(`/api/${tenantId}/trucks/${carId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cars'],
      });
    },
    onError: (error) => {
      console.error('Error deleting car:', error);
    },
  });

  const handleDelete = (carId: string) => {
    if (
      window.confirm('Er du sikker på at du vil slette denne bilen? Handlingen kan ikke angres.')
    ) {
      deleteCarMutation.mutate(carId);
    }
  };

  const initialRecords = getCarsQuery.data ?? [];
  const [records, setRecords] = useState(initialRecords);
  const [nameQuery, setNameQuery] = useState('');
  const [regnrQuery, setRegnrQuery] = useState('');
  const [modelQuery, setModelQuery] = useState('');
  const [debouncedNameQuery] = useDebouncedValue(nameQuery, 200);
  const [debouncedRegnrQuery] = useDebouncedValue(regnrQuery, 200);
  const [debouncedModelQuery] = useDebouncedValue(modelQuery, 200);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<CarType>>({
    columnAccessor: 'regnr',
    direction: 'asc',
  });

  useEffect(() => {
    setRecords(getCarsQuery.data ?? []);
  }, [getCarsQuery.data]);

  useEffect(() => {
    setRecords(
      initialRecords?.filter(({ regnr, model, Employee, status }) => {
        if (
          debouncedRegnrQuery !== '' &&
          !`${regnr}`.toLowerCase().includes(debouncedRegnrQuery.trim().toLowerCase())
        ) {
          return false;
        }

        if (
          debouncedModelQuery !== '' &&
          !`${model}`.toLowerCase().includes(debouncedModelQuery.trim().toLowerCase())
        ) {
          return false;
        }

        if (
          debouncedNameQuery !== '' &&
          (Employee == null ||
            !`${Employee.name}`.toLowerCase().includes(debouncedNameQuery.trim().toLowerCase()))
        ) {
          return false;
        }

        if (selectedStatus.length && !selectedStatus.some((d) => d === status)) return false;

        return true;
      })
    );
  }, [debouncedRegnrQuery, debouncedModelQuery, debouncedNameQuery, selectedStatus]);

  const openCreateModal = () => {
    setAddModalOpened(true);
  };

  useEffect(() => {
    const data = sortBy(records, sortStatus.columnAccessor) as CarType[];
    setRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
  }, [sortStatus]);

  const userCount = records.length || 0;

  if (getCarsQuery.error) return <Text>Error...</Text>;
  if (getCarsQuery.isLoading) return <Text>Loading...</Text>;

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
            accessor: 'regnr',
            title: 'Regnr',
            render: (car) => car.regnr,
            sortable: true,
            filter: (
              <TextInput
                label="Regnr"
                description="Vis biler som har det spesifiserte regnr"
                placeholder="Søk etter regnr..."
                leftSection={<IconSearch size={16} />}
                rightSection={
                  <ActionIcon
                    size="sm"
                    variant="transparent"
                    c="dimmed"
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
            accessor: 'model',
            title: 'Modell',
            render: (car) => car.model,
            sortable: true,
            filter: (
              <TextInput
                label="Modell"
                description="Vis biler som har denne modellen"
                placeholder="Søk etter modell..."
                leftSection={<IconSearch size={16} />}
                rightSection={
                  <ActionIcon
                    size="sm"
                    variant="transparent"
                    c="dimmed"
                    onClick={() => setModelQuery('')}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                }
                value={modelQuery}
                onChange={(e) => setModelQuery(e.currentTarget.value)}
              />
            ),
            filtering: modelQuery !== '',
          },
          {
            accessor: 'status',
            title: 'Status',
            render: (car) => car.status,
            sortable: true,
            filter: (
              <MultiSelect
                label="Status"
                placeholder="Filtrer etter status"
                data={[
                  { value: 'Available', label: 'Available' },
                  { value: 'In Use', label: 'In Use' },
                  { value: 'Maintenance', label: 'Maintenance' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
            ),
            filtering: selectedStatus.length > 0,
          },
          {
            accessor: 'employee',
            title: 'Sjåfør',
            sortable: true,
            render: (car) => car.Employee?.name || 'Ingen sjåfør',
            filter: (
              <TextInput
                label="Sjåfør"
                description="Vis biler basert på sjåfør"
                placeholder="Søk etter sjåfør..."
                leftSection={<IconSearch size={16} />}
                rightSection={
                  <ActionIcon
                    size="sm"
                    variant="transparent"
                    color="dimmed"
                    onClick={() => setNameQuery('')}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                }
                value={nameQuery}
                onChange={(e) => setNameQuery(e.currentTarget.value)}
              />
            ),
            filtering: regnrQuery !== '',
          },
          {
            accessor: 'actions',
            title: 'Rediger/slett',
            textAlign: 'right',
            render: (car: CarType) => (
              <Group gap={4} justify="right" wrap="nowrap">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="blue"
                  onClick={() => {
                    setSelectedCarId(car.id);
                    open();
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={() => handleDelete(car.id)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
      />
      <EditCarDrawer carId={selectedCarId} opened={opened} onClose={close} />
      <AddCarModal
        opened={addModalOpened}
        tenantId={tenantId}
        onClose={() => setAddModalOpened(false)}
        onCarAdded={getCarsQuery.refetch}
      />
    </Paper>
  );
}
