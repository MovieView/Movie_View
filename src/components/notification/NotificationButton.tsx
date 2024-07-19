import Image from 'next/image';
import React, { useState } from 'react';
import clsx from 'clsx';
import useOutsideClick from '@/hooks/useOutsideClick';


interface INotificationButtonProps {
  notification: INotification[] | null;
  unreadCount: number;
  visibility: boolean;
  changeVisibility: () => void;
  children: React.ReactNode;
}


const NotificationButton : React.FC<INotificationButtonProps> = ({
  notification,
  unreadCount,
  visibility,
  changeVisibility,
  children
}) => {
  const elementRef = React.useRef<HTMLDivElement>(null);
  useOutsideClick({ref: elementRef, isVisible: visibility, onClose: () => changeVisibility()});
  
  const className = clsx(
    'flex flex-col items-center justify-center p-1 rounded-lg relative hover:bg-second',
    visibility && 'bg-second'
  );

  return (
    <div className={className} ref={elementRef}>
      <button 
        onClick={changeVisibility}
      >
        <Image 
          src={'/icons/notification.svg'} 
          alt='notification'
          width={8} 
          height={8} 
          className='w-9 h-9'
        />
      </button>
      {(notification && unreadCount > 0) && (
        <div className='absolute top-0 right-0 bg-red-600 w-2 p-2 rounded-full'>
        </div>
      )}
      {children}
    </div>
  );
}

export default NotificationButton;