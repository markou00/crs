'use client';

import { Title } from '@mantine/core';
import { useState } from 'react';
import { CustomerCard } from './CustomerCard/CustomerCard';
import { CustomerModal } from './CustomerModal/CustomerModal';
import { mockCustomers } from './data';
import { Customer } from './types';
import prisma from '@/prisma/client';

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const openModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalOpened(true);
  };

  return (
    <>
      <Title style={{ paddingBottom: '20px' }}>Kunder</Title>
      <div style={{ maxWidth: 800, margin: 'auto' }}>
        {mockCustomers.map((customer) => (
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
