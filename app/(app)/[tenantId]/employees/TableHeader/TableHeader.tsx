import { Text, Box, Group, Button } from '@mantine/core';
import { IconUserPlus } from '@tabler/icons-react';

interface TableHeaderProps {
  userCount: number;
  onClick: () => void;
}

export function TableHeader({ userCount, onClick }: TableHeaderProps) {
  return (
    <Box pb="md">
      <Group justify="space-between">
        <Group>
          <Text fw={700} size="lg">
            Ansatte
          </Text>
          <Text size="xs">({userCount} brukere)</Text>
        </Group>
        <Group>
          <Button leftSection={<IconUserPlus size={16} />} onClick={onClick}>
            Ny ansatt
          </Button>
        </Group>
      </Group>
    </Box>
  );
}
