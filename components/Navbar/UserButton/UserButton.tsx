import { UnstyledButton, Group, Avatar, Text, rem, Box } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';

import classes from './UserButton.module.css';

export function UserButton() {
  return (
    <UnstyledButton className={classes.user}>
      <Group>
        <Avatar
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png"
          radius="xl"
        />

        <Box style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            Harriette Spoonlicker
          </Text>

          <Text c="dimmed" size="xs">
            hspoonlicker@outlook.com
          </Text>
        </Box>

        <IconLogout style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
      </Group>
    </UnstyledButton>
  );
}
