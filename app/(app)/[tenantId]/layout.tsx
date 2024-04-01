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

import '@mantine/core/styles.layer.css';
import '@mantine/charts/styles.css';
import 'mantine-datatable/styles.layer.css';

import { Navbar } from '@/components/Navbar/Navbar';
import { getAllUsers, getAuthUser, getUser } from '@/lib/server/actions/user-actions';
import { UserButton } from '@/components/Navbar/UserButton/UserButton';
import { getAgreements } from '@/lib/server/actions/agreements-actions';
import { getCustomers } from '@/lib/server/actions/customer-actions';
import { getContainers } from '@/lib/server/actions/containers-actions';
import { getJobs } from '@/lib/server/actions/job-actions';
import { getEmployees } from '@/lib/server/actions/employees-actions';
import { getCars } from '@/lib/server/actions/car-actions';

export default async function AppShellLayout({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['auth-user'],
    queryFn: getAuthUser,
  });

  await queryClient.prefetchQuery({
    queryKey: ['user'],
    queryFn: () => getUser,
  });

  await queryClient.prefetchQuery({
    queryKey: ['agreements'],
    queryFn: getAgreements,
  });

  await queryClient.prefetchQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  await queryClient.prefetchQuery({
    queryKey: ['containers'],
    queryFn: getContainers,
  });

  await queryClient.prefetchQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
  });

  await queryClient.prefetchQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });

  await queryClient.prefetchQuery({
    queryKey: ['cars'],
    queryFn: getCars,
  });

  await queryClient.prefetchQuery({
    queryKey: ['all-users'],
    queryFn: getAllUsers,
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
