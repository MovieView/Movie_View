'use client';

import React from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import UserProfile from '../login/UserProfile';

interface NavBarProps {
  isFixed: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ isFixed }) => {
  const navBarStyle = clsx(
    'justify-between', 'items-center', 'py-5', 'px-10', 'bg-first', 'w-full', 'flex',
    isFixed ? 'fixed' : 'relative',
    isFixed ? 'z-10': 'z-0'
  ); 

  return (
    <div className={navBarStyle}>
      <Link href={"/"}>
        <h1 className="text-xl">MovieView</h1>
      </Link>
      <div className="flex justify-between items-center text-xl gap-4">
        <UserProfile />
      </div>
    </div>
  );
};

export default NavBar;
