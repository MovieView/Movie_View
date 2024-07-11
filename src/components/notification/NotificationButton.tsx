import Image from 'next/image';
import NotificationContainer from './NotificationContainer';
import useMarkNotificationAsRead from '@/hooks/useMarkNotificationAsRead';
import React, { useState } from 'react';
import useNotification from '@/hooks/useNotification';
import clsx from 'clsx';
import useOutsideClick from '@/hooks/useOutsideClick';


const NotificationButton = () => {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const [visibility, setVisibility] = useState<boolean>(false);
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

  useOutsideClick({ref: elementRef, isVisible: visibility, onClose: () => setVisibility(false)});

  const changeVisibility = () => {
    setVisibility(!visibility);
  };
  
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
          alt="Notification" 
          width={8} 
          height={8} 
          className='w-9 h-9'
        />
      </button>
      {(notification && unreadCount > 0) && (
        <div className='absolute top-0 right-0 bg-red-600 w-2 p-2 rounded-full'>
        </div>
      )}
      <NotificationContainer 
        visibility={visibility} 
        changeVisibility={changeVisibility}
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
    </div>
  );
}

export default NotificationButton;