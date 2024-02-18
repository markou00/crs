'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Title, TextInput, Button, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Customer } from './types';
import { customerFormValidation } from '../utils/customerFormValidation';

interface Params {
  customerId: string;
}

export default function CustomerDetails({ params }: { params: Params }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Initialize the form with useForm hook, providing initial values and validation rules
  const form = useForm({
    initialValues: {
      name: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
    },
    validate: customerFormValidation, // Use shared validation logic
  });

  useEffect(() => {
    if (!initialDataLoaded) {
      const fetchCustomerData = async () => {
        try {
          const response = await fetch(`/api/customers/${params.customerId}`);
          if (!response.ok) throw new Error('Failed to fetch');
          const data: Customer = await response.json();
          form.setValues(data); // Update form values with fetched customer data
          setInitialDataLoaded(true); // Prevent further unnecessary updates
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        }
      };

      if (params?.customerId) {
        fetchCustomerData();
      }
    }
  }, [params.customerId, form, initialDataLoaded]);

  // Function to handle form submission
  const saveChanges = async (returnToCustomers = false) => {
    const isValid = form.validate();
    if (!isValid.hasErrors) {
      try {
        const response = await fetch(`/api/customers/${params.customerId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form.values),
        });
        if (!response.ok) throw new Error('Failed to update the customer');
        if (returnToCustomers) {
          router.push('/customers');
        } else {
          const updatedCustomer = await response.json();
          form.setValues(updatedCustomer);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while updating the customer'
        );
      }
    }
  };

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

        router.push('/customers');
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred while deleting the customer');
        }
      }
    }
  };

  if (error) return <div>An error occurred: {error}</div>;
  if (!initialDataLoaded) return <div>Loading...</div>;

  return (
    <div>
      <Title>Kundeinformasjon</Title>
      <form onSubmit={form.onSubmit(() => saveChanges(false))}>
        <Group pt={30} pb={30}>
          <Stack>
            <TextInput label="Navn" {...form.getInputProps('name')} />
            <TextInput label="Kontaktnavn" {...form.getInputProps('contactName')} />
            <TextInput label="Epost" {...form.getInputProps('contactEmail')} />
            <TextInput label="Telefon" {...form.getInputProps('contactPhone')} />
          </Stack>
          <Stack>
            <TextInput label="Adresse" {...form.getInputProps('address')} />
            <TextInput label="Sted" {...form.getInputProps('city')} />
            <TextInput label="Postnr" {...form.getInputProps('postalCode')} />
            <TextInput label="Land" {...form.getInputProps('country')} />
          </Stack>
        </Group>
      </form>
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
          <Button type="button" onClick={() => saveChanges(true)}>
            Lagre og gå til kundeoversikt
          </Button>
          <Button type="submit">Lagre</Button>
        </Stack>
      </Group>
    </div>
  );
}
