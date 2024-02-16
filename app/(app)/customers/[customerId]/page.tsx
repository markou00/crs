'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Title, TextInput, Button, Group, Stack } from '@mantine/core';
import { Customer } from './types';

interface Params {
  customerId: string;
}

export default function CustomerDetails({ params }: { params: Params }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await fetch(`/api/customers/${params.customerId}`);
        if (!response.ok) throw new Error('Failed to fetch');

        const data: Customer = await response.json();
        setCustomer(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      }
    };

    if (params?.customerId) {
      fetchCustomerData();
    }
  }, [params.customerId]);

  const deleteCustomer = async () => {
    if (
      window.confirm(
        'Er du sikker på at du vil slette denne kunden? Denne handlingen kan ikke angres.'
      )
    ) {
      try {
        const response = await fetch(`/api/customers/${params.customerId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete the customer');

        // Optionally, redirect the user back to the customers list page or handle the UI update
        router.push('/customers'); // Adjust the path as necessary
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred while deleting the customer');
        }
      }
    }
  };

  useEffect(() => {
    setEditCustomer(customer); // Initialize editable customer state with fetched data
  }, [customer]);

  const handleInputChange = (field: keyof Customer, value: string) => {
    setEditCustomer((prevState) => {
      // Check if prevState is null to maintain type safety
      if (prevState === null) return null;

      // Correctly updates prevState with the new field value
      return { ...prevState, [field]: value };
    });
  };

  const saveChanges = async (returnToCustomers = false) => {
    if (!editCustomer) return;
    try {
      const response = await fetch(`/api/customers/${params.customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCustomer),
      });
      if (!response.ok) throw new Error('Failed to update the customer');

      if (returnToCustomers) {
        router.push('/customers');
      } else {
        const updatedCustomer = await response.json();
        setCustomer(updatedCustomer);
        setEditCustomer(updatedCustomer);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while updating the customer');
      }
    }
  };

  if (error) return <div>An error occurred: {error}</div>;
  if (!editCustomer) return <div>Loading...</div>;

  return (
    <div>
      <Title>Kundeinformasjon</Title>
      <Group pt={30} pb={30}>
        <Stack align="flex-start" justify="flex-start">
          <TextInput
            label="Navn"
            value={editCustomer.name || ''}
            onChange={(event) => handleInputChange('name', event.currentTarget.value)}
          />
          <TextInput
            label="Kontaktnavn"
            value={editCustomer.contactName || ''}
            onChange={(event) => handleInputChange('contactName', event.currentTarget.value)}
          />
          <TextInput
            label="Epost"
            value={editCustomer.contactEmail || ''}
            onChange={(event) => handleInputChange('contactEmail', event.currentTarget.value)}
          />
          <TextInput
            label="Telefon"
            value={editCustomer.contactPhone || ''}
            onChange={(event) => handleInputChange('contactPhone', event.currentTarget.value)}
          />
        </Stack>
        <Stack align="flex-start" justify="flex-start">
          <TextInput
            label="Adresse"
            value={editCustomer.address || ''}
            onChange={(event) => handleInputChange('address', event.currentTarget.value)}
          />
          <TextInput
            label="Sted"
            value={editCustomer.city || ''}
            onChange={(event) => handleInputChange('city', event.currentTarget.value)}
          />
          <TextInput
            label="Postnr"
            value={editCustomer.postalCode || ''}
            onChange={(event) => handleInputChange('postalCode', event.currentTarget.value)}
          />
          <TextInput
            label="Land"
            value={editCustomer.country || ''}
            onChange={(event) => handleInputChange('country', event.currentTarget.value)}
          />
        </Stack>
      </Group>
      <Group>
        <Stack>
          <Button variant="default" onClick={() => router.push('/customers')}>
            Avbryt
          </Button>
          <Button color="red" onClick={deleteCustomer}>
            Slett kunde
          </Button>
        </Stack>
        <Stack>
          <Button onClick={() => saveChanges()}>Lagre</Button>
          <Button onClick={() => saveChanges(true)}>Lagre og gå til kundeoversikt</Button>
        </Stack>
      </Group>
    </div>
  );
}
