'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
//import { useState } from 'react';
import { Employee } from '@prisma/client';
import { Drawer, Button, TextInput, Group, Flex, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
//import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { employeeFormValidation } from '../utils/employeeFormValidation';

interface EditEmployeeDrawerProps {
  employee: Employee;
  opened: boolean;
  tenantId: string;
  onClose: () => void;
}

export function EditEmployeeDrawer({
  employee,
  opened,
  tenantId,
  onClose,
}: EditEmployeeDrawerProps) {
  // const supabase = createClientComponentClient();
  // const [tenantId, setTenantId] = useState('');
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      status: employee.status,
      picture: employee.picture,
    },
    validate: employeeFormValidation,
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async () => {
      if (form.validate().hasErrors) throw new Error('The form has erros');

      const response = await fetch(`/api/${tenantId}/employees/${employee.id}`, {
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
              <Button
                type="button"
                onClick={() => updateEmployeeMutation.mutate()}
                loading={updateEmployeeMutation.isPending}
              >
                Lagre
              </Button>
            </Group>
          </Flex>
        </Drawer.Body>
      </Drawer>
    </>
  );
}
