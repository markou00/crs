'use client';

import { DataTable } from 'mantine-datatable';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { Group, Box, ActionIcon } from '@mantine/core';

// Define a type for the records
type RecordType = {
  name: string;
  status: string;
  email: string;
  car: string;
};

// Define a type for the actions
type ActionType = 'view' | 'edit' | 'delete';

// Define a type for the showModal parameter
type ShowModalParams = {
  company: RecordType;
  action: ActionType;
};

export default function EmployeesPage() {
  // Updated dummy data for the table
  const records: RecordType[] = [
    { name: 'John Doe', status: 'online', email: 'john.doe@example.com', car: 'EL 12345' },
    { name: 'Jane Smith', status: 'offline', email: 'jane.smith@example.com', car: 'EK 67890' },
    {
      name: 'William Johnson',
      status: 'online',
      email: 'william.johnson@example.com',
      car: 'BT 54321',
    },
    {
      name: 'Emma Williams',
      status: 'offline',
      email: 'emma.williams@example.com',
      car: 'CV 98765',
    },
    { name: 'Olivia Brown', status: 'online', email: 'olivia.brown@example.com', car: 'DN 13579' },
    { name: 'James Davis', status: 'offline', email: 'james.davis@example.com', car: 'DP 24680' },
    {
      name: 'Isabella Miller',
      status: 'online',
      email: 'isabella.miller@example.com',
      car: 'UF 11223',
    },
    {
      name: 'Michael Wilson',
      status: 'offline',
      email: 'michael.wilson@example.com',
      car: 'HR 33445',
    },
  ];

  // Dummy function to show modal - replace this with your actual modal logic
  const showModal = ({ company, action }: ShowModalParams) => {
    console.log(`Showing ${action} modal for company`, company);
  };

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
          title: <Box mr={6} />,
          textAlign: 'left',
          render: (company: RecordType) => (
            <Group gap={4} justify="right" wrap="nowrap">
              <ActionIcon
                size="sm"
                variant="subtle"
                color="green"
                onClick={() => showModal({ company, action: 'view' })}
              >
                <IconEye size={16} />
              </ActionIcon>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="blue"
                onClick={() => showModal({ company, action: 'edit' })}
              >
                <IconEdit size={16} />
              </ActionIcon>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="red"
                onClick={() => showModal({ company, action: 'delete' })}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ),
        },
      ]}
      records={records}
    />
  );
}
