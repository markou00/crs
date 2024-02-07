'use client';

import { AppShell, Avatar, Burger, Flex, Group, Text } from '@mantine/core';
import { ReactNode } from 'react';
import { Navbar } from '@/components/Navbar/Navbar';
import useNavbarStore from '@/lib/states/useNavbarDisclosure';

export default function AppShellLayout({ children }: { children: ReactNode }) {
  const opened = useNavbarStore((state) => state.opened);
  const toggle = useNavbarStore((state) => state.toggle);

  return (
    <AppShell
      header={{ height: { base: 60, md: 70, lg: 80 } }}
      navbar={{
        width: { base: 200, md: 300, lg: 400 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Flex align="center" gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text size="xl">CRS</Text>
          </Flex>
          <Avatar
            src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png"
            radius="xl"
            hiddenFrom="md"
          />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <Navbar />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
