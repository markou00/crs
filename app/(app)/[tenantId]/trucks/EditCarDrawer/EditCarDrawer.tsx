'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Drawer, Button, TextInput, Group, Flex, Select, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { carFormValidation } from '../utils/carFormValidation';

interface EditCarDrawerProps {
  carId: string;
  opened: boolean;
  onClose: () => void;
}

export function EditCarDrawer({ carId, opened, onClose }: EditCarDrawerProps) {
  const supabase = createClientComponentClient();
  const [tenantId, setTenantId] = useState('');
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      regnr: '',
      model: '',
      status: '',
    },
    validate: carFormValidation,
  });

  const getCarQuery = useQuery({
    queryKey: [carId],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      const _tenantId = user.data.user?.user_metadata.tenantId;
      setTenantId(_tenantId);
      const response = await fetch(`/api/${_tenantId}/trucks/${carId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const fullData = await response.json();
      const data = {
        regnr: fullData.regnr,
        model: fullData.model,
        status: fullData.status,
      };
      form.setValues(data);

      return data;
    },
  });

  const updateCarMutation = useMutation({
    mutationFn: async () => {
      if (form.validate().hasErrors) throw new Error('The form has erros');

      const response = await fetch(`/api/${tenantId}/trucks/${carId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.values),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    },
    retry: false,
    onSuccess: () => {
      onClose();
      queryClient.invalidateQueries({ queryKey: ['cars', tenantId] });
    },
    onError: (error) => {
      console.error('Failed to update car:', error);
    },
  });

  if (getCarQuery.isError) {
    return <Text>An error occurred: {getCarQuery.error.message}</Text>;
  }
  if (getCarQuery.isLoading) return <Text>Loading...</Text>;

  return (
    <>
      <Drawer
        opened={opened}
        onClose={onClose}
        title="Rediger bil"
        position="right"
        padding="xl"
        size="lg"
      >
        <Drawer.Body>
          <Flex direction="column" gap="md">
            <TextInput label="Regnr" {...form.getInputProps('regnr')} />
            <TextInput label="Modell" {...form.getInputProps('model')} />
            <Select
              label="Status"
              {...form.getInputProps('status')}
              data={[
                { value: 'Available', label: 'Available' },
                { value: 'In Use', label: 'In Use' },
                { value: 'Maintenance', label: 'Maintenance' },
              ]}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" onClick={() => updateCarMutation.mutate()}>
                Lagre
              </Button>
            </Group>
          </Flex>
        </Drawer.Body>
      </Drawer>
    </>
  );
}
