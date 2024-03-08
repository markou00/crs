import { Text, Box, Group, Button, Stack } from '@mantine/core';
import { IconUserPlus } from '@tabler/icons-react';

interface TableHeaderProps {
  userCount: number;
  onClick: () => void;
}

export function TableHeader({ userCount, onClick }: TableHeaderProps) {
  return (
    <Box pb="md">
      <Stack>
        <Stack>
          <Group justify="space-between">
            <Group>
              <Text fw={700} size="lg">
                Sjåfører
              </Text>
              <Text size="xs">
                ({userCount} {userCount === 1 ? 'sjåfør' : 'sjåfører'})
              </Text>
            </Group>
            <Group>
              <Button leftSection={<IconUserPlus size={16} />} onClick={onClick}>
                Ny sjåfør
              </Button>
            </Group>
          </Group>
        </Stack>
        <Stack>
          <Text size="xs">
            Bruk ikonene i første rad for å filtrere basert på navn, status og bil.
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
}
