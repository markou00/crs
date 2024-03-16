'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Drawer, Button, TextInput, Group, Flex, Select, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { employeeFormValidation } from '../utils/employeeFormValidation';

interface EditEmployeeDrawerProps {
  employeeId: string;
  opened: boolean;
  onClose: () => void;
}

export function EditEmployeeDrawer({ employeeId, opened, onClose }: EditEmployeeDrawerProps) {
  const supabase = createClientComponentClient();
  const [tenantId, setTenantId] = useState('');
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      status: '',
      picture: '',
    },
    validate: employeeFormValidation,
  });

  const getEmployeeQuery = useQuery({
    queryKey: [employeeId],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      const _tenantId = user.data.user?.user_metadata.tenantId;
      setTenantId(_tenantId);
      const response = await fetch(`/api/${_tenantId}/employees/${employeeId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const fullData = await response.json();
      const data = {
        name: fullData.name || '',
        email: fullData.email || '',
        phone: fullData.phone || '',
        status: fullData.status || '',
        picture: fullData.picture || '',
      };
      form.setValues(data);

      return data;
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async () => {
      if (form.validate().hasErrors) throw new Error('The form has erros');

      const response = await fetch(`/api/${tenantId}/employees/${employeeId}`, {
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
      queryClient.invalidateQueries({ queryKey: ['employees', tenantId] });
    },
    onError: (error) => {
      console.error('Failed to update employee:', error);
    },
  });

  if (getEmployeeQuery.isError) {
    return <Text>An error occurred: {getEmployeeQuery.error.message}</Text>;
  }
  if (getEmployeeQuery.isLoading) return <Text>Loading...</Text>;

  return (
    <>
      <Drawer
        opened={opened}
        onClose={onClose}
        title="Rediger sjåfør"
        position="right"
        padding="xl"
        size="lg"
      >
        <Drawer.Body>
          <Flex direction="column" gap="md">
            <TextInput label="Name" {...form.getInputProps('name')} />
            <TextInput label="Email" {...form.getInputProps('email')} />
            <TextInput label="Phone" {...form.getInputProps('phone')} />
            <Select
              label="Status"
              {...form.getInputProps('status')}
              data={[
                { value: 'Tilgjengelig', label: 'Tilgjengelig' },
                { value: 'Utilgjengelig', label: 'Utilgjengelig' },
                { value: 'På ferie', label: 'På ferie' },
                { value: 'Permittert', label: 'Permittert' },
                { value: 'Sykemeldt', label: 'Sykemeldt' },
              ]}
            />
            <TextInput label="Bilde-URL" {...form.getInputProps('picture')} />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" onClick={() => updateEmployeeMutation.mutate()}>
                Lagre
              </Button>
            </Group>
          </Flex>
        </Drawer.Body>
      </Drawer>
    </>
  );
}
