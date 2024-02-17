import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Box,
  Flex,
  Group,
  Text,
} from '@mantine/core';
import { ReactNode } from 'react';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

import { Navbar } from '@/components/Navbar/Navbar';
import { getAuthUser } from '@/lib/server/actions/user-actions';
import { UserButton } from '@/components/Navbar/UserButton/UserButton';

export default async function AppShellLayout({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['auth-user'],
    queryFn: getAuthUser,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AppShell
        header={{ height: { base: 60, md: 70, lg: 80 } }}
        navbar={{ width: { base: 60, xs: 60, sm: 220, md: 270 }, breakpoint: 'none' }}
        padding="md"
      >
        <AppShellHeader>
          <Group h="100%" px="md" justify="space-between">
            <Flex align="center" gap="sm">
              <Text size="xl">CRS</Text>
            </Flex>

            <Box hiddenFrom="md">
              <UserButton />
            </Box>
          </Group>
        </AppShellHeader>

        <AppShellNavbar>
          <Navbar />
        </AppShellNavbar>

        <AppShellMain>{children}</AppShellMain>
      </AppShell>
    </HydrationBoundary>
  );
}
