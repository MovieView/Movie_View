'use client';

import React from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import UserProfile from '../login/UserProfile';
import NotificationButton from '../notification/NotificationButton';
import { useSession } from 'next-auth/react';
import NotificationFakeButton from '../notification/NotificationFakeButton';

interface INavBarProps {
  isFixed: boolean;
}

const NavBar: React.FC<INavBarProps> = ({ isFixed }) => {
  const { data: session } = useSession();

  const navBarStyle = clsx(
    'justify-between',
    'items-center',
    'py-5',
    'px-10',
    'w-full',
    'flex',
    'bg-fourth',
    'shadow-md',
    isFixed ? 'fixed' : 'relative',
    isFixed ? 'z-10' : 'z-0'
  );

  return (
    <div className={navBarStyle}>
      <Link href={'/'}>
        <h1 className='text-xl font-semibold'>MovieView</h1>
      </Link>
      <div className='flex justify-between items-center text-xl gap-4'>
        <NotificationFakeButton />
        {session && <NotificationButton />}
        <UserProfile />
      </div>
    </div>
  );
};

export default NavBar;
