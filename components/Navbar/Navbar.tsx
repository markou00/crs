'use client';

import { Box, Text } from '@mantine/core';
import Link from 'next/link';
import {
  IconSettings,
  IconUsers,
  IconSteeringWheel,
  IconClipboard,
  IconCheckbox,
  IconTruck,
  IconColumns3,
  IconBox,
  IconLayoutDashboard,
} from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { User } from 'lucia';

import { UserButton } from './UserButton/UserButton';
import classes from './Navbar.module.css';

export function Navbar({ user }: { user: User }) {
  console.log(user);
  const pathname = usePathname();

  const data = [
    {
      link: `/${user.tenantId}/dashboard`,
      label: 'Dashboard',
      icon: IconLayoutDashboard,
    },
    {
      link: `/${user.tenantId}/dispatch`,
      label: 'Planlegging',
      icon: IconColumns3,
    },
    {
      link: `/${user.tenantId}/jobs`,
      label: 'Oppdrag',
      icon: IconCheckbox,
    },
    {
      link: `/${user.tenantId}/agreements`,
      label: 'Avtaler',
      icon: IconClipboard,
    },
    {
      link: `/${user.tenantId}/customers`,
      label: 'Kunder',
      icon: IconUsers,
    },
    {
      link: `/${user.tenantId}/containers`,
      label: 'Beholdere',
      icon: IconBox,
    },
    {
      link: `/${user.tenantId}/trucks`,
      label: 'Biler',
      icon: IconTruck,
    },
    {
      link: `/${user.tenantId}/employees`,
      label: 'Sjåfører',
      icon: IconSteeringWheel,
    },
    {
      link: `/${user.tenantId}/settings`,
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

  return (
    <Box className={classes.navbar}>
      <div className={classes.links}>{links}</div>

      <div className={classes.footer}>
        <UserButton user={user} />
      </div>
    </Box>
  );
}
