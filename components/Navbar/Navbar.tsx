import { Box, useMantineTheme } from '@mantine/core';
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
import { useEffect, useState } from 'react';
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs';
import { useMediaQuery } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import { UserButton } from './UserButton/UserButton';
import classes from './Navbar.module.css';
import useNavbarStore from '@/lib/states/useNavbarDisclosure';

export function Navbar() {
  const pathname = usePathname();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const toggle = useNavbarStore((state) => state.toggle);
  const [user, setUser] = useState<User>();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      data.user && setUser(data.user);
    };

    getUser();
  }, []);

  const data = [
    {
      link: `/${user?.user_metadata?.tenantId}/dashboard`,
      label: 'Dashboard',
      icon: IconLayoutDashboard,
    },
    { link: `/${user?.user_metadata?.tenantId}/customers`, label: 'Kunder', icon: IconUsers },
    { link: `/${user?.user_metadata?.tenantId}/employees`, label: 'Ansatte', icon: IconBriefcase },
    { link: `/${user?.user_metadata?.tenantId}/agreements`, label: 'Avtaler', icon: IconClipboard },
    { link: `/${user?.user_metadata?.tenantId}/jobs`, label: 'Oppdrag', icon: IconCheckbox },
    { link: `/${user?.user_metadata?.tenantId}/trucks`, label: 'Biler', icon: IconTruck },
    {
      link: `/${user?.user_metadata?.tenantId}/dispatch`,
      label: 'Planlegging',
      icon: IconColumns3,
    },
    { link: `/${user?.user_metadata?.tenantId}/containers`, label: 'Beholdere', icon: IconBox },
    {
      link: `/${user?.user_metadata?.tenantId}/settings`,
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
      onClick={() => isMobile && toggle()}
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
