'use client';

import { Employee } from '@prisma/client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { IconEdit, IconTrash, IconSearch, IconX, IconTruck } from '@tabler/icons-react';
import {
  Group,
  ActionIcon,
  Button,
  Paper,
  Text,
  Stack,
  TextInput,
  MultiSelect,
  Tooltip,
} from '@mantine/core';
// import { getEmployees } from '@/lib/server/actions/employees-actions';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { EmployeePicture } from '../../../../components/Employees/EmployeePicture';
import { TableHeader } from './TableHeader/TableHeader';
import { AddEmployeeModal } from './AddEmployeeModal/AddEmployeeModal';
import { EditEmployeeDrawer } from './EditEmployeeDrawer/EditEmployeeDrawer';
import { CreateCarRelationModal } from './CreateCarRelationModal/CreateCarRelationModal';
import { EmployeeType } from './types';

export default function EmployeesPage() {
  /* const getEmployeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: () => getEmployees(),
  }); */

  const [addModalOpened, setAddModalOpened] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const supabase = createClientComponentClient();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>();
  const [opened, { open, close }] = useDisclosure(false);
  const [showCarRelationModal, setShowCarRelationModal] = useState(false);
  const [selectedEmployeeForCar, setSelectedEmployeeForCar] = useState<number | null>(null);
  const queryClient = useQueryClient();

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
        car: employee.Car
          ? {
              regnr: employee.Car.regnr,
              model: employee.Car.model,
              status: employee.Car.status,
            }
          : 'No Car',
      }));
    },
    enabled: !!tenantId,
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: number) => {
      await fetch(`/api/${tenantId}/employees/${employeeId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employees'],
      });
    },
    onError: (error) => {
      console.error('Error deleting employee:', error);
    },
  });

  const handleDelete = (employeeId: number) => {
    if (
      window.confirm('Er du sikker på at du vil slette denne sjåføren? Handlingen kan ikke angres.')
    ) {
      deleteEmployeeMutation.mutate(employeeId);
    }
  };

  const deleteTruckRelationMutation = useMutation({
    mutationFn: async (employeeId: number) => {
      await fetch(`/api/${tenantId}/employees/${employeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId: null }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['availableCars', tenantId] });
    },
    onError: (error) => {
      console.error('Error deleting car relation:', error);
    },
  });

  const handleDeleteTruckRelation = (employeeId: number) => {
    if (window.confirm('Er du sikker på at du vil fjerne relasjonen til denne bilen?')) {
      deleteTruckRelationMutation.mutate(employeeId);
    }
  };

  type MutationArgs = {
    employeeId: number;
    carRelationId: string;
  };

  const createTruckRelationMutation = useMutation<void, Error, MutationArgs>({
    mutationFn: async ({ employeeId, carRelationId }) => {
      const carIdInt = parseInt(carRelationId, 10);

      await fetch(`/api/${tenantId}/employees/${employeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId: carIdInt }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['availableCars', tenantId] });
    },
    onError: (error) => {
      console.error('Error creating car relation:', error);
    },
  });

  const initialRecords = getEmployeesQuery.data ?? [];
  const [records, setRecords] = useState(initialRecords);
  const [nameQuery, setNameQuery] = useState('');
  const [regnrQuery, setRegnrQuery] = useState('');
  const [debouncedNameQuery] = useDebouncedValue(nameQuery, 200);
  const [debouncedRegnrQuery] = useDebouncedValue(regnrQuery, 200);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<EmployeeType>>({
    columnAccessor: 'name',
    direction: 'asc',
  });

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

  const openCreateModal = () => {
    setAddModalOpened(true);
  };

  const handleOpenCarRelationModal = (employeeId: number) => {
    setSelectedEmployeeForCar(employeeId);
    setShowCarRelationModal(true);
  };

  const handleCarSelected = (carId: string) => {
    if (selectedEmployeeForCar && carId) {
      createTruckRelationMutation.mutate(
        {
          employeeId: selectedEmployeeForCar,
          carRelationId: carId,
        },
        {
          onSuccess: () => {
            console.log('Relasjon mellom sjåfør og bil er oppdatert.');
          },
          onError: (error) => {
            console.error('Det oppstod en feil ved oppdatering av relasjonen:', error);
          },
        }
      );
      setShowCarRelationModal(false);
    } else {
      console.error('Mangler nødvendig informasjon for å tildele bil til sjåfør.');
    }
  };

  useEffect(() => {
    const data = sortBy(records, sortStatus.columnAccessor) as EmployeeType[];
    setRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
  }, [sortStatus]);

  const userCount = records.length || 0;

  if (getEmployeesQuery.error) return <Text>Error...</Text>;
  if (getEmployeesQuery.isLoading) return <Text>Loading...</Text>;

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
            accessor: 'name',
            title: 'Navn',
            width: '30%',
            sortable: true,
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
          { accessor: 'phone', title: 'Telefon', width: '20%', sortable: true },
          {
            accessor: 'status',
            title: 'Status',
            width: '20%',
            render: (employee) => employee.status,
            sortable: true,
            filter: (
              <MultiSelect
                label="Status"
                placeholder="Filtrer etter status"
                data={[
                  { value: 'Tilgjengelig', label: 'Tilgjengelig' },
                  { value: 'Utilgjengelig', label: 'Utilgjengelig' },
                  { value: 'På ferie', label: 'På ferie' },
                  { value: 'Permittert', label: 'Permittert' },
                  { value: 'Sykemeldt', label: 'Sykemeldt' },
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
            width: '8%',
            sortable: true,
            render: (employee) => (
              <div>
                {employee.Car ? (
                  <>
                    <Group gap="xs" justify="center">
                      <Tooltip
                        label={`Modell: ${employee.Car.model}, Status: ${employee.Car.status}`}
                        withArrow
                        position="bottom"
                      >
                        <Text style={{ width: '60px' }} ta="center">
                          {employee.Car.regnr}
                        </Text>
                      </Tooltip>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => handleDeleteTruckRelation(employee.id)}
                        loading={deleteTruckRelationMutation.isPending}
                      >
                        <IconTruck size={16} />
                      </ActionIcon>
                    </Group>
                  </>
                ) : (
                  <Group justify="center">
                    <Button
                      size="xs"
                      color="green"
                      rightSection={<IconTruck size={16} />}
                      onClick={() => handleOpenCarRelationModal(employee.id)}
                    >
                      Tildel
                    </Button>
                  </Group>
                )}
              </div>
            ),
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
            textAlign: 'center',
            width: '0%',
            render: (employee: EmployeeType) => (
              <Group gap={4} justify="center" wrap="nowrap">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="blue"
                  onClick={() => {
                    setSelectedEmployee(employee);
                    open();
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={() => handleDelete(employee.id)}
                  loading={deleteEmployeeMutation.isPending}
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

      {selectedEmployee && (
        <EditEmployeeDrawer
          employee={selectedEmployee}
          opened={opened}
          onClose={close}
          tenantId={tenantId}
        />
      )}
      <AddEmployeeModal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
        onEmployeeAdded={getEmployeesQuery.refetch}
        tenantId={tenantId}
      />
      <CreateCarRelationModal
        opened={showCarRelationModal}
        onClose={() => setShowCarRelationModal(false)}
        onCarSelect={handleCarSelected}
        tenantId={tenantId}
      />
    </Paper>
  );
}
