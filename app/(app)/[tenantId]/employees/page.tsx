'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from 'mantine-datatable';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { Group, ActionIcon } from '@mantine/core';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Define the type for an employee record
type EmployeeType = {
  id: number;
  name: string;
  status: string;
  email: string;
  car: string; // Adjust based on actual data structure
};

// Define a type for the showModal parameter
type ShowModalParams = {
  employee: EmployeeType;
  action: 'view' | 'edit' | 'delete';
};

export default function EmployeesPage() {
  const [tenantId, setTenantId] = useState('');
  const supabase = createClientComponentClient();

  // Fetch employees data
  const getEmployeesQuery = useQuery<EmployeeType[]>({
    queryKey: ['employees', tenantId], // Include tenantId in the query key
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      const _tenantId = user.data.user?.user_metadata.tenantId;
      setTenantId(_tenantId);
      const response = await fetch(`/api/${_tenantId}/employees`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  // Dummy function to show modal - replace this with your actual modal logic
  const showModal = ({ employee, action }: ShowModalParams) => {
    console.log(`Showing ${action} modal for employee`, employee);
  };

  if (getEmployeesQuery.isLoading) return <div>Loading...</div>;

  return (
    <DataTable
      pinFirstColumn
      withTableBorder
      striped
      highlightOnHover
      columns={[
        { accessor: 'name', title: 'Navn' },
        { accessor: 'status', title: 'Status' },
        { accessor: 'email', title: 'Epost' },
        { accessor: 'car', title: 'Bil' },
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
