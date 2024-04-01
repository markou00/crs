import { useMutation } from '@tanstack/react-query';
import { Modal, TextInput, Select, Button, Group, Flex } from '@mantine/core';
import { useForm } from '@mantine/form';

import { carFormValidation } from '../utils/carFormValidation';
import { AddCarModalProps, CarFormValues } from './types';

export function AddCarModal({
  opened,
  onClose,
  tenantId,
  getCarsQuery,
  setRecords,
}: AddCarModalProps) {
  const form = useForm<CarFormValues>({
    initialValues: {
      regnr: '',
      model: '',
      status: '',
    },
    validate: carFormValidation,
  });

  const createCarMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/${tenantId}/trucks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form.values, tenantId }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    },
    retry: false,
    onSuccess: async () => {
      const { data } = await getCarsQuery.refetch();
      setRecords(data?.cars);
      form.reset();
      onClose();
    },
    onError: (error) => {
      console.error('Failed to add car:', error);
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Legg til ny bil">
      <form onSubmit={form.onSubmit(() => createCarMutation.mutate())}>
        <Flex direction="column" gap="md">
          <TextInput label="Regnr" {...form.getInputProps('regnr')} />
          <TextInput label="Modell" {...form.getInputProps('model')} />
          <Select
            label="Tilstand"
            placeholder="Velg tilsand"
            data={[
              { value: 'Operativ', label: 'Operativ' },
              { value: 'Skadet', label: 'Skadet' },
              { value: 'Til reparasjon', label: 'Til reparasjon' },
              { value: 'Vedlikehold', label: 'Vedlikehold' },
            ]}
            {...form.getInputProps('status')}
          />
          <Group justify="flex-end" mt="md">
            <Button type="submit" loading={createCarMutation.isPending}>
              Lagre
            </Button>
          </Group>
        </Flex>
      </form>
    </Modal>
  );
}
