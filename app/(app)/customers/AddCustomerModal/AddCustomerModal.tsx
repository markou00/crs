import { Modal, TextInput, Select, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
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

    validate: {
      name: (value) => (value ? null : 'Navn er påkrevd'),
      type: (value) => (value ? null : 'Type er påkrevd'),
      contactName: (value) => (value ? null : 'Kontaktnavn er påkrevd'),
      contactEmail: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Ugyldig epost'),
      contactPhone: (value) => {
        // Allow an optional "+" at the start, followed by up to 15 digits
        const regex = /^\+?\d{0,15}$/;
        if (!regex.test(value)) return 'Ugyldig telefonnummer. Maks 15 tall.';
        return null; // Return null if the value passes validation
      },
      address: (value) => (value ? null : 'Adresse er påkrevd'),
      city: (value) => (value ? null : 'Sted er påkrevd'),
      postalCode: (value) => (value ? null : 'Postnr er påkrevd'),
      country: (value) => (value ? null : 'Land er påkrevd'),
    },
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
          // Handle error, e.g., show error notification
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
