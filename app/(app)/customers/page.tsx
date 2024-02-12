'use client';

import { Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { CustomerCard } from './CustomerCard/CustomerCard';
import { CustomerModal } from './CustomerModal/CustomerModal';
import { Customer } from './types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  // Function to open the modal with the selected customer
  const openModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalOpened(true);
  };

  // Fetch customers data from the API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        const data: Customer[] = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      }
    };

    fetchCustomers();
  }, []); // The empty array ensures this effect runs once on mount

  return (
    <>
      <Title style={{ paddingBottom: '20px' }}>Kunder</Title>
      <div style={{ maxWidth: 800, margin: 'auto' }}>
        {customers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} onOpenModal={openModal} />
        ))}
      </div>

      <CustomerModal
        customer={selectedCustomer}
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      />
    </>
  );
}
