import { useMutation } from '@tanstack/react-query';
import { Modal, TextInput, Select, Button, Group, Flex } from '@mantine/core';
import { useForm } from '@mantine/form';

import { employeeFormValidation } from '../utils/employeeFormValidation';
import { AddEmployeeModalProps, EmployeeFormValues } from './types';

export function AddEmployeeModal({
  opened,
  onClose,
  onEmployeeAdded,
  tenantId,
}: AddEmployeeModalProps) {
  const form = useForm<EmployeeFormValues>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      status: '',
      picture: '',
    },
    validate: employeeFormValidation,
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/${tenantId}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form.values, tenantId }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      if (onEmployeeAdded) onEmployeeAdded();
      onClose();
    },
    retry: false,
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Legg til ny sjåfør">
      <form onSubmit={form.onSubmit(() => createEmployeeMutation.mutate())}>
        <Flex direction="column" gap="md">
          <TextInput label="Navn" {...form.getInputProps('name')} />
          <TextInput label="Epost" {...form.getInputProps('email')} />
          <TextInput label="Tlf" {...form.getInputProps('phone')} />
          <Select
            label="Status"
            placeholder="Velg status"
            data={[
              { value: 'Tilgjengelig', label: 'Tilgjengelig' },
              { value: 'Utilgjengelig', label: 'Utilgjengelig' },
              { value: 'På ferie', label: 'På ferie' },
              { value: 'Permittert', label: 'Permittert' },
              { value: 'Sykemeldt', label: 'Sykemeldt' },
            ]}
            {...form.getInputProps('status')}
          />
          <TextInput label="Picture URL" {...form.getInputProps('picture')} />
          <Group justify="flex-end" mt="md">
            <Button type="submit">Lagre</Button>
          </Group>
        </Flex>
      </form>
    </Modal>
  );
}
