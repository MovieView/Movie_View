import Image from 'next/image';
import NotificationContainer from './NotificationContainer';
import { useEffect, useState } from 'react';
import useNotification from '@/hooks/useNotification';


const NotificationButton = () => {
  const [visibility, setVisibility] = useState<boolean>(false);
  const { 
    notification, 
    fetchNotification, 
    isLoading, 
    error 
  } = useNotification();
  
  let className = 'flex flex-col items-center justify-center p-1 rounded-lg relative hover:bg-second';
  if (visibility) {
    className += ' bg-second';
  }

  // 만약 알림창이 열려있는 상태에서 다른 곳을 클릭하면 알림창이 닫히도록 하는 함수
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        visibility && 
        e.target instanceof Element && 
        !e.target.closest('#notification-container')
      ) {
        setVisibility(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [visibility]);

  return (
    <div className={className}>
      <button 
        onClick={() => setVisibility(!visibility)}
      >
        <Image 
          src={'/icons/notification.svg'} 
          alt="Notification" 
          width={8} 
          height={8} 
          className='w-9 h-9'
        />
      </button>
      <NotificationContainer 
        visibility={visibility} 
        loadNotifications={fetchNotification}
        notifications={notification} 
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}

export default NotificationButton;