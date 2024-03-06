'use client';

import { Title, Text, Button, Group, TextInput, rem } from '@mantine/core';
import { IconSearch, IconUserPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';

import { CustomerCard } from './CustomerCard/CustomerCard';
import { AddCustomerModal } from './AddCustomerModal/AddCustomerModal';
import { Customer } from './types';

export default function CustomersPage() {
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [search, setSearch] = useState('');
  const [tenantId, setTenantId] = useState('');
  const supabase = createClientComponentClient();

  const getCustomersQuery = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      const _tenantId = user.data.user?.user_metadata.tenantId;
      setTenantId(_tenantId);
      const response = await fetch(`/api/${_tenantId}/customers`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // returns Promise<Customer[]>
    },
  });

  // Function to open the modal for creating a new customer
  const openCreateModal = () => {
    setAddModalOpened(true);
  };

  const filteredCustomers = getCustomersQuery.data?.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase())
  );

  if (getCustomersQuery.error) return <Text>Error...</Text>;
  if (getCustomersQuery.isLoading) return <Text>Loading...</Text>;

  return (
    <>
      <Group justify="space-between" style={{ marginBottom: '20px', marginRight: '50px' }}>
        <Title>Kunder</Title>
        <TextInput
          radius="xl"
          size="md"
          placeholder="Search questions"
          rightSectionWidth={42}
          leftSection={<IconSearch style={{ width: rem(18), height: rem(18) }} stroke={1.5} />}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
        <Button onClick={openCreateModal} leftSection={<IconUserPlus size={16} />}>
          Ny kunde
        </Button>
      </Group>
      <div style={{ maxWidth: 800, margin: 'auto' }}>
        {filteredCustomers?.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} tenantId={tenantId} />
        ))}
      </div>

      <AddCustomerModal
        opened={addModalOpened}
        tenantId={tenantId}
        onClose={() => setAddModalOpened(false)}
        onCustomerAdded={getCustomersQuery.refetch}
      />
    </>
  );
}
