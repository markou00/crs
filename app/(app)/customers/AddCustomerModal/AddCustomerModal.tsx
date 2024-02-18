import { Modal, TextInput, Select, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { customerFormValidation } from '../utils/customerFormValidation';
import { AddCustomerModalProps, CustomerFormValues } from './types';

export function AddCustomerModal({ opened, onClose, onCustomerAdded }: AddCustomerModalProps) {
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

  function handleSubmit(values: CustomerFormValues) {
    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
      .then((response) => {
        if (response.ok) {
          if (onCustomerAdded) onCustomerAdded();
          onClose();
        } else {
          console.error('Failed to add customer');
        }
      })
      .catch((error) => {
        console.error('Failed to add customer:', error);
      });
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Legg til ny kunde">
      <form onSubmit={form.onSubmit(handleSubmit)}>
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
