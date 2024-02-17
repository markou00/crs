'use client';

import { Box, Text } from '@mantine/core';
import Link from 'next/link';
import {
  IconSettings,
  IconUsers,
  IconBriefcase,
  IconClipboard,
  IconCheckbox,
  IconTruck,
  IconColumns3,
  IconBox,
  IconLayoutDashboard,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

import { UserButton } from './UserButton/UserButton';
import classes from './Navbar.module.css';
import { getAuthUser } from '@/lib/server/actions/user-actions';

export function Navbar() {
  const { data: authUserData } = useQuery({
    queryKey: ['auth-user'],
    queryFn: getAuthUser,
  });

  const pathname = usePathname();

  const data = [
    {
      link: `/${authUserData?.data?.data?.user?.user_metadata?.tenantId}/dashboard`,
      label: 'Dashboard',
      icon: IconLayoutDashboard,
    },
    {
      link: `/${authUserData?.data?.data?.user?.user_metadata?.tenantId}/customers`,
      label: 'Kunder',
      icon: IconUsers,
    },
    {
      link: `/${authUserData?.data?.data?.user?.user_metadata?.tenantId}/employees`,
      label: 'Ansatte',
      icon: IconBriefcase,
    },
    {
      link: `/${authUserData?.data?.data?.user?.user_metadata?.tenantId}/agreements`,
      label: 'Avtaler',
      icon: IconClipboard,
    },
    {
      link: `/${authUserData?.data?.data?.user?.user_metadata?.tenantId}/jobs`,
      label: 'Oppdrag',
      icon: IconCheckbox,
    },
    {
      link: `/${authUserData?.data?.data?.user?.user_metadata?.tenantId}/trucks`,
      label: 'Biler',
      icon: IconTruck,
    },
    {
      link: `/${authUserData?.data?.data?.user?.user_metadata?.tenantId}/dispatch`,
      label: 'Planlegging',
      icon: IconColumns3,
    },
    {
      link: `/${authUserData?.data?.data?.user?.user_metadata?.tenantId}/containers`,
      label: 'Beholdere',
      icon: IconBox,
    },
    {
      link: `/${authUserData?.data?.data?.user?.user_metadata?.tenantId}/settings`,
      label: 'Innstillinger',
      icon: IconSettings,
    },
  ];

  const links = data.map((item) => (
    <Link
      className={classes.link}
      data-active={pathname === item.link ? true : undefined}
      href={item.link}
      key={item.label}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <Text visibleFrom="sm">{item.label}</Text>
    </Link>
  ));

  if (authUserData) {
    return (
      <Box className={classes.navbar}>
        <div className={classes.links}>{links}</div>

        <div className={classes.footer}>
          <UserButton />
        </div>
      </Box>
    );
  }
}
