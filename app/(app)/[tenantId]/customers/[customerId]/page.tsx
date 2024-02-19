'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Title, TextInput, Button, Group, Stack } from '@mantine/core';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';
import { useForm } from '@mantine/form';

import { customerFormValidation } from '../utils/customerFormValidation';

interface Params {
  customerId: string;
}

export default function CustomerDetails({ params }: { params: Params }) {
  const router = useRouter();
  const [tenantId, setTenantId] = useState('');

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
    validate: customerFormValidation,
  });
  const supabase = createClientComponentClient();

  const getCustomerQuery = useQuery({
    queryKey: [params.customerId],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      const _tenantId = user.data.user?.user_metadata.tenantId;
      setTenantId(_tenantId);
      const response = await fetch(`/api/${_tenantId}/customers/${params.customerId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      form.setValues(data);

      return data;
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async () => {
      if (form.validate().hasErrors) throw new Error('The form has erros');

      const response = await fetch(`/api/${tenantId}/customers/${params.customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.values),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    },
    retry: false,
    onSuccess: () => router.back(),
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async () => {
      if (
        window.confirm(
          'Er du sikker på at du vil slette denne kunden? Denne handlingen kan ikke angres.'
        )
      ) {
        const response = await fetch(`/api/${tenantId}/customers/${params.customerId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete the customer');
      }
    },
    retry: false,
    onSuccess: () => router.back(),
  });

  if (getCustomerQuery.isError) {
    return <div>An error occurred: {getCustomerQuery.error.message}</div>;
  }
  if (getCustomerQuery.isLoading) return <div>Loading...</div>;
  return (
    <div>
      <Title>Kundeinformasjon</Title>
      <form>
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
          <Button variant="default" onClick={() => router.back()}>
            Avbryt
          </Button>
          <Button color="red" onClick={() => deleteCustomerMutation.mutate()}>
            Slett kunde
          </Button>
        </Stack>
        <Stack>
          <Button type="button" onClick={() => updateCustomerMutation.mutate()}>
            Lagre
          </Button>
        </Stack>
      </Group>
    </div>
  );
}
