import { Box } from '@mantine/core';
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
import { usePathname } from 'next/navigation';
import { UserButton } from './UserButton/UserButton';
import classes from './Navbar.module.css';

const data = [
  { link: '/dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
  { link: '/customers', label: 'Kunder', icon: IconUsers },
  { link: '/employees', label: 'Ansatte', icon: IconBriefcase },
  { link: '/agreements', label: 'Avtaler', icon: IconClipboard },
  { link: '/jobs', label: 'Oppdrag', icon: IconCheckbox },
  { link: '/trucks', label: 'Biler', icon: IconTruck },
  { link: '/dispatch', label: 'Planlegging', icon: IconColumns3 },
  { link: '/containers', label: 'Beholdere', icon: IconBox },
  { link: '/settings', label: 'Innstillinger', icon: IconSettings },
];

export function Navbar() {
  const pathname = usePathname();

  const links = data.map((item) => (
    <Link
      className={classes.link}
      data-active={pathname === item.link ? true : undefined}
      href={item.link}
      key={item.label}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </Link>
  ));

  return (
    <Box className={classes.navbar}>
      <div className={classes.links}>{links}</div>

      <div className={classes.footer}>
        <UserButton />
      </div>
    </Box>
  );
}
