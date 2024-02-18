'use client';

import { Title, Button, Group, TextInput, rem } from '@mantine/core';
import { IconSearch, IconUserPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { CustomerCard } from './CustomerCard/CustomerCard';
import { AddCustomerModal } from './AddCustomerModal/AddCustomerModal';
import { Customer } from './types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [search, setSearch] = useState('');

  // Function to open the modal for creating a new customer
  const openCreateModal = () => {
    setAddModalOpened(true);
  };

  // Fetch customers data from the API and sort them by name
  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data: Customer[] = await response.json();

      // Sort the customers by name in ascending order
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));

      setCustomers(sortedData);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to fetch customers:', error.message);
      } else {
        console.error('Failed to fetch customers');
      }
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []); // The empty array ensures this effect runs once on mount

  // Callback function to be called after successful addition
  const onCustomerAdded = () => {
    fetchCustomers();
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase())
  );

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
        {filteredCustomers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>

      <AddCustomerModal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
        onCustomerAdded={onCustomerAdded}
      />
    </>
  );
}
