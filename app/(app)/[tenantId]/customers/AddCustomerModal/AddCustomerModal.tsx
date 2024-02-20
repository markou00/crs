import { useMutation } from '@tanstack/react-query';
import { Modal, TextInput, Select, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';

import { customerFormValidation } from '../utils/customerFormValidation';
import { AddCustomerModalProps, CustomerFormValues } from './types';

export function AddCustomerModal({
  opened,
  onClose,
  onCustomerAdded,
  tenantId,
}: AddCustomerModalProps) {
  const form = useForm<CustomerFormValues>({
    initialValues: {
      name: '',
      type: '',
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

  const createCustomerMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/${tenantId}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form.values, tenantId }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      if (onCustomerAdded) onCustomerAdded();
      onClose();
    },
    retry: false,
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Legg til ny kunde">
      <form onSubmit={form.onSubmit(() => createCustomerMutation.mutate())}>
        <TextInput label="Navn" {...form.getInputProps('name')} />
        <Select
          label="Type"
          placeholder="Velg type"
          data={[
            { value: 'Bedrift', label: 'Bedrift' },
            { value: 'Privat', label: 'Privat' },
          ]}
          {...form.getInputProps('type')}
        />
        <TextInput label="Kontaktnavn" {...form.getInputProps('contactName')} />
        <TextInput label="Epost" {...form.getInputProps('contactEmail')} />
        <TextInput label="Tlf" {...form.getInputProps('contactPhone')} />
        <TextInput label="Adresse" {...form.getInputProps('address')} />
        <TextInput label="Sted" {...form.getInputProps('city')} />
        <TextInput label="Postnr" {...form.getInputProps('postalCode')} />
        <TextInput label="Land" {...form.getInputProps('country')} />
        <Group justify="flex-end" mt="md">
          <Button type="submit">Lagre</Button>
        </Group>
      </form>
    </Modal>
  );
}
