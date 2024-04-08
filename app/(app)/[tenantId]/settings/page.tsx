'use client';

import {
  Group,
  Title,
  Modal,
  Button,
  TextInput,
  Flex,
  Divider,
  Center,
  ActionIcon,
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAt, IconClick, IconSend, IconTrash, IconUsersPlus } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { DataTable } from 'mantine-datatable';
import { useMutation, useQuery } from '@tanstack/react-query';

import { deleteUser, getAllUsers, inviteUser } from '@/lib/server/actions/user-actions';

export default function SettignsPage() {
  const getAllUsersQuery = useQuery({
    queryKey: ['all-users'],
    queryFn: () => getAllUsers(),
  });
  const [records, setRecords] = useState(getAllUsersQuery.data?.tenantUsers);

  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      email: '',
    },

    validate: (values) => ({
      email: /^\S+@\S+.+\S$/.test(values.email) ? null : 'Ugyldig e-post adress!',
    }),
  });

  const inviteUserMutation = useMutation({
    mutationFn: async () => {
      if (form.validate().hasErrors) throw new Error('Invalid email!');

      const user = await inviteUser(form.values.email);
      return user;
    },
    retry: false,
    onSuccess: async () => {
      close();
      form.values.email = '';
      const { data } = await getAllUsersQuery.refetch();
      setRecords(data?.tenantUsers);
    },
    onError: (error) => console.log(error.message),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data, error } = await deleteUser(id);

      if (error) throw new Error("Couldn't delete the user");

      return data;
    },
    retry: false,

    onSuccess: async () => {
      const { data } = await getAllUsersQuery.refetch();
      setRecords(data?.tenantUsers);
    },
    onError: (error: any) => console.log(error.message),
  });

  return (
    <>
      <Group justify="space-between">
        <Title>Innstillinger</Title>
        <Button onClick={open} leftSection={<IconUsersPlus />}>
          Inviter
        </Button>
      </Group>

      <Divider mt="sm" mb="sm" />

      <DataTable
        withTableBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        records={records}
        columns={[
          {
            accessor: 'id',
          },
          {
            accessor: 'email',
          },
          {
            accessor: 'created_at',
            render: ({ created_at }) => (
              <Box fw={700}>{created_at ? new Date(created_at).toLocaleDateString('NO') : ''}</Box>
            ),
          },
          {
            accessor: 'last_sign_in_at',
            render: ({ last_sign_in_at }) => (
              <Box fw={700}>
                {last_sign_in_at ? new Date(last_sign_in_at).toLocaleDateString('NO') : ''}
              </Box>
            ),
          },
          {
            accessor: 'actions',
            title: (
              <Center>
                <IconClick size={16} />
              </Center>
            ),
            width: '0%',
            render: (record) => (
              <Group gap={4} justify="right" wrap="nowrap">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  loading={deleteUserMutation.isPending}
                >
                  <IconTrash
                    size={16}
                    onClick={() => deleteUserMutation.mutate({ id: record.id })}
                  />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
      />

      <Modal
        opened={opened}
        onClose={() => {
          close();
          form.values.email = '';
        }}
        title="Invitere brukere"
      >
        <Flex direction="column" gap="md">
          <TextInput
            data-autofocus
            label="E-post addresse til den du vil invitere:"
            placeholder="hello@example.com"
            leftSection={<IconAt width="1.2rem" />}
            mt="md"
            {...form.getInputProps('email')}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              Avbryt
            </Button>
            <Button
              loading={inviteUserMutation.isPending}
              leftSection={<IconSend width="1.4rem" />}
              onClick={() => inviteUserMutation.mutate()}
            >
              Send
            </Button>
          </Group>
        </Flex>
      </Modal>
    </>
  );
}
