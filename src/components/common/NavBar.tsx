'use client';

import React, { useCallback, useEffect } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import UserProfile from '../login/UserProfile';
import NotificationButton from '../notification/NotificationButton';
import { useSession } from 'next-auth/react';
import NotificationFakeButton from '../notification/NotificationFakeButton';
import NavBarDropMenuButton from './NavBarDropMenuButton';
import useNotification from '@/hooks/useNotification';
import useMarkNotificationAsRead from '@/hooks/useMarkNotificationAsRead';
import NotificationContainer from '../notification/NotificationContainer';


interface INavBarProps {
  isFixed: boolean;
}

const NavBar: React.FC<INavBarProps> = ({ isFixed }) => {
  const { data: session } = useSession();
  const [notificationVisibility, setNotificationVisibility] = React.useState<boolean>(false);
  const [dropDownVisibility, setDropDownVisibility] = React.useState<boolean>(false);
  const [mobileMenuVisibility, setMobileMenuVisibility] = React.useState<boolean>(false);

  const { 
    notification, 
    fetchNotification, 
    isLoading, 
    error,
    unreadCount,
    currentPage,
    totalPage,
    firstPage,
    lastPage,
    previousPage,
    nextPage
  } = useNotification(true);

  const { 
    markEveryAsRead,
    error: markError,
    isProcessing: isMarkProcessing
  } = useMarkNotificationAsRead();

  const changeNotificationVisibility = () => {
    setNotificationVisibility(!notificationVisibility);
  }

  const disableNotificationVisibility = () => {
    setNotificationVisibility(false);
  }

  const handleResize = useCallback(() => {
    if (window.innerWidth > 768) {
      setMobileMenuVisibility(false);
      setNotificationVisibility(false);
    } else {
      setMobileMenuVisibility(true);
      setNotificationVisibility(false);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

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
        <div className='justify-between items-center text-xl gap-4 hidden md:flex'>
          <NotificationFakeButton />
          {(session && !mobileMenuVisibility) && 
            <NotificationButton 
              notification={notification}
              unreadCount={unreadCount}
              visibility={notificationVisibility}
              changeVisibility={changeNotificationVisibility}
            >
              <NotificationContainer
                visibility={notificationVisibility}
                changeVisibility={changeNotificationVisibility}
                loadNotifications={fetchNotification}
                notifications={notification}
                isLoading={isLoading}
                error={error}
                currentPage={currentPage}
                totalPage={totalPage}
                turnFirstPage={firstPage}
                turnLastPage={lastPage}
                turnNextPage={nextPage}
                turnPreviousPage={previousPage}
                markEveryAsRead={markEveryAsRead}
                markError={markError}
                isMarkProcessing={isMarkProcessing}
              />
            </NotificationButton>
          }
          <UserProfile />
        </div>
        {(mobileMenuVisibility) && (
          <NavBarDropMenuButton 
            visibility={dropDownVisibility}
            notificationVisibility={notificationVisibility}
            changeVisibility={() => setDropDownVisibility(!dropDownVisibility)}
            disableNotificationVisibility={disableNotificationVisibility}
            changeNotificationVisibility={changeNotificationVisibility}
          >
            <NotificationContainer 
              visibility={dropDownVisibility}
              changeVisibility={() => setDropDownVisibility(!dropDownVisibility)}
              loadNotifications={fetchNotification}
              notifications={notification}
              isLoading={isLoading}
              error={error}
              currentPage={currentPage}
              totalPage={totalPage}
              turnFirstPage={firstPage}
              turnLastPage={lastPage}
              turnNextPage={nextPage}
              turnPreviousPage={previousPage}
              markEveryAsRead={markEveryAsRead}
              markError={markError}
              isMarkProcessing={isMarkProcessing}
            />
          </NavBarDropMenuButton>
        )} 
      </div>
    </div>
  );
};

export default NavBar;
