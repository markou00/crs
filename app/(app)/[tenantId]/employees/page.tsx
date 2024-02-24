'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from 'mantine-datatable';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { Group, ActionIcon } from '@mantine/core';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { EmployeePicture } from '../../../../components/Employees/EmployeePicture';

type EmployeeType = {
  id: number;
  name: string;
  status: string;
  email: string;
  picture: string;
  Car: { regnr: string } | null;
};

type ShowModalParams = {
  employee: EmployeeType;
  action: 'view' | 'edit' | 'delete';
};

export default function EmployeesPage() {
  const [tenantId, setTenantId] = useState('');
  const supabase = createClientComponentClient();
  const [selectedRecords, setSelectedRecords] = useState<EmployeeType[]>([]);

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

  const showModal = ({ employee, action }: ShowModalParams) => {
    console.log(`Showing ${action} modal for employee`, employee);
  };

  if (getEmployeesQuery.isLoading) return <div>Loading...</div>;

  return (
    <DataTable
      borderRadius="md"
      pinFirstColumn
      withTableBorder
      striped
      highlightOnHover
      selectedRecords={selectedRecords}
      onSelectedRecordsChange={setSelectedRecords}
      columns={[
        {
          accessor: 'name',
          title: 'Navn',
          render: (employee: EmployeeType) => (
            <Group>
              <EmployeePicture imageSrc={employee.picture} />
              {employee.name}
            </Group>
          ),
        },
        { accessor: 'status', title: 'Status' },
        { accessor: 'email', title: 'Epost' },
        { accessor: 'car', title: 'Bil', render: (row) => row.Car?.regnr || 'No Car' },
        {
          accessor: 'actions',
          title: '',
          textAlign: 'right',
          render: (employee: EmployeeType) => (
            <Group gap={4} justify="right" wrap="nowrap">
              <ActionIcon
                size="sm"
                variant="subtle"
                color="green"
                onClick={() => showModal({ employee, action: 'view' })}
              >
                <IconEye size={16} />
              </ActionIcon>
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
                onClick={() => showModal({ employee, action: 'delete' })}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ),
        },
      ]}
      records={getEmployeesQuery.data ?? []}
    />
  );
}
