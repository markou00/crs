'use client';

import { Car } from '@prisma/client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { IconEdit, IconTrash, IconSearch, IconX } from '@tabler/icons-react';
import { Group, ActionIcon, Paper, Text, TextInput, MultiSelect } from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getCars } from '@/lib/server/actions/car-actions';
import { TableHeader } from './TableHeader/TableHeader';
import { AddCarModal } from './AddCarModal/AddCarModal';
import { EditCarDrawer } from './EditCarDrawer/EditCarDrawer';
import { CarType } from './types';

export default function CarsPage() {
  const getCarsQuery = useQuery({
    queryKey: ['cars'],
    queryFn: () => getCars(),
  });

  const [addModalOpened, setAddModalOpened] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const supabase = createClientComponentClient();
  const [selectedCar, setSelectedCar] = useState<Car | null>();
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

  const [records, setRecords] = useState(getCarsQuery.data?.cars);
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

  const deleteCarMutation = useMutation({
    mutationFn: async (carId: number) => {
      await fetch(`/api/${tenantId}/trucks/${carId}`, {
        method: 'DELETE',
      });
    },

    onSuccess: async () => {
      const { data } = await getCarsQuery.refetch();
      setRecords(data?.cars);
    },
    onError: (error) => {
      console.error('Error deleting car:', error);
    },
  });

  const handleDelete = (carId: number) => {
    if (
      // eslint-disable-next-line no-alert
      window.confirm('Er du sikker på at du vil slette denne bilen? Handlingen kan ikke angres.')
    ) {
      deleteCarMutation.mutate(carId);
    }
  };

  useEffect(() => {
    setRecords(
      getCarsQuery.data?.cars?.filter(({ regnr, model, Employee, status }) => {
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
    const data = sortBy(records ?? [], sortStatus.columnAccessor) as CarType[];
    setRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
  }, [sortStatus]);

  const userCount = (records ?? []).length || 0;

  if (getCarsQuery.error) return <Text>Error...</Text>;
  if (getCarsQuery.isLoading) return <Text>Loading...</Text>;

  return (
    <Paper style={{ overflow: 'hidden', borderRadius: '8px' }} m="0" pb="md" pt="xs">
      <TableHeader userCount={userCount} onClick={() => openCreateModal()} />
      <DataTable
        borderRadius="sm"
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
            title: 'Tilstand',
            render: (car) => car.status,
            sortable: true,
            filter: (
              <MultiSelect
                label="Tilstand"
                placeholder="Filtrer etter tilstand"
                data={[
                  { value: 'Operativ', label: 'Operativ' },
                  { value: 'Skadet', label: 'Skadet' },
                  { value: 'Til reparasjon', label: 'Til reparasjon' },
                  { value: 'Vedlikehold', label: 'Vedlikehold' },
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
            textAlign: 'center',
            width: '0%',
            render: (car: CarType) => (
              <Group gap={4} justify="center" wrap="nowrap">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="blue"
                  onClick={() => {
                    setSelectedCar(car);
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
                  loading={deleteCarMutation.isPending}
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
      {selectedCar && (
        <EditCarDrawer
          car={selectedCar}
          opened={opened}
          onClose={() => {
            close();
            setSelectedCar(null);
          }}
          getCarsQuery={getCarsQuery}
          setRecords={setRecords}
        />
      )}
      <AddCarModal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
        tenantId={tenantId}
        getCarsQuery={getCarsQuery}
        setRecords={setRecords}
      />
    </Paper>
  );
}
