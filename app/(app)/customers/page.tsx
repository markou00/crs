'use client';

import { Title, Button, Group } from '@mantine/core';
import { IconUserPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { CustomerCard } from './CustomerCard/CustomerCard';
import { AddCustomerModal } from './AddCustomerModal/AddCustomerModal';
import { Customer } from './types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [addModalOpened, setAddModalOpened] = useState(false);

  // Function to open the modal for creating a new customer
  const openCreateModal = () => {
    setAddModalOpened(true);
  };

  // Fetch customers data from the API
  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data: Customer[] = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []); // The empty array ensures this effect runs once on mount

  // Callback function to be called after successful addition
  const onCustomerAdded = () => {
    fetchCustomers();
  };

  return (
    <>
      <Group justify="space-between" style={{ marginBottom: '20px', marginRight: '50px' }}>
        <Title>Kunder</Title>
        <Button
          onClick={openCreateModal}
          leftSection={<IconUserPlus size={16} />}
          style={{ backgroundColor: '#85BC24', color: 'white' }}
        >
          Ny kunde
        </Button>
      </Group>
      <div style={{ maxWidth: 800, margin: 'auto' }}>
        {customers.map((customer) => (
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
