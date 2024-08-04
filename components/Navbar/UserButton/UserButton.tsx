'use client';

import { UnstyledButton, Group, Avatar, Text, rem, Box } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { User } from 'lucia';

import classes from './UserButton.module.css';
import { logout } from '@/lib/server/actions/user-actions';

export function UserButton({ user }: { user: Partial<User> }) {
  return (
    <UnstyledButton className={classes.user} onClick={() => logout()}>
      <Group>
        <Avatar radius="xl" />

        <Box style={{ flex: 1, maxWidth: '65%', overflow: 'hidden' }}>
          <Text size="sm" fw={500}>
            {user.firstName} {user.lastName}
          </Text>

          <Text c="dimmed" size="xs">
            {user.email}
          </Text>
        </Box>

        <IconLogout style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
      </Group>
    </UnstyledButton>
  );
}
