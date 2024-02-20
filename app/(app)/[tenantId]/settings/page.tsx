'use client';

import { Group, Title, Modal, Button, TextInput, Flex, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAt, IconSend, IconUsersPlus } from '@tabler/icons-react';

export default function SettignsPage() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Group justify="space-between">
        <Title>Innstillinger</Title>
        <Button onClick={open} leftSection={<IconUsersPlus />}>
          Inviter
        </Button>
      </Group>

      <Divider mt="sm" mb="sm" />

      <Modal opened={opened} onClose={close} title="Invitere brukere">
        <Flex direction="column" gap="md">
          <TextInput
            data-autofocus
            label="E-post addresse til den du vil invitere:"
            placeholder="hello@example.com"
            leftSection={<IconAt width="1.2rem" />}
            mt="md"
          />
          <Button leftSection={<IconSend width="1.4rem" />}>Send</Button>
        </Flex>
      </Modal>
    </>
  );
}
