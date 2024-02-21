'use client';

import { Group, Title, Modal, Button, TextInput, Flex, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAt, IconSend, IconUsersPlus } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';

import { inviteUser } from '@/lib/server/actions/user-actions';

export default function SettignsPage() {
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
    onSuccess: () => {
      close();
      form.values.email = '';
    },
    onError: (error) => console.log(error.message),
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
          <Button
            loading={inviteUserMutation.isPending}
            leftSection={<IconSend width="1.4rem" />}
            onClick={() => inviteUserMutation.mutate()}
          >
            Send
          </Button>
        </Flex>
      </Modal>
    </>
  );
}
