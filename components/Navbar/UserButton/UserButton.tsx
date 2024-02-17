'use client';

import { UnstyledButton, Group, Avatar, Text, rem, Box } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { IconLogout } from '@tabler/icons-react';

import classes from './UserButton.module.css';
import { getAuthUser, getUser } from '@/lib/server/actions/user-actions';

export function UserButton() {
  const { data: authUserData } = useQuery({
    queryKey: ['auth-user'],
    queryFn: getAuthUser,
  });
  const email = authUserData?.data?.data.user?.email || ' ';

  const { data: user, isFetched } = useQuery({
    queryKey: ['user'],
    queryFn: () => getUser(email),
  });

  const router = useRouter();

  const supabase = createClientComponentClient();

  const handleSignOut = () => {
    supabase.auth.signOut();
    router.push('/');
  };

  if (isFetched && user) {
    return (
      <UnstyledButton className={classes.user} onClick={handleSignOut}>
        <Group>
          <Avatar radius="xl" />

          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              {user?.user?.firstName} {user?.user?.lastName}
            </Text>

            <Text c="dimmed" size="xs">
              {email}
            </Text>
          </Box>

          <IconLogout style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
        </Group>
      </UnstyledButton>
    );
  }
}
