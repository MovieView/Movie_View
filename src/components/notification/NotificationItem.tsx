import { formatDate } from '@/utils/notificationUtils';
import Image from 'next/image'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Spinner from '../common/Spinner';


interface INotificationItemProps {
  icon?: string;
  url?: string | null;
  id: string;
  createdAt: string;
  read: boolean;
  message: (string | React.ReactNode)[];
  deleteMode: boolean;
  changeVisibility: () => void;
}

const NotificationItem : React.FC<INotificationItemProps> = ({ 
  icon, 
  url,
  id,
  message, 
  createdAt,
  read,
  deleteMode,
  changeVisibility
}) => {
  const { push } = useRouter();
  const [currentRead, setCurrentRead] = useState<boolean>(read);
  const [processingRead, setProcessingRead] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const notifIcon = icon ? icon : '/icons/notification.svg';
  const formattedDateString = formatDate(createdAt);

  let className = 'w-full px-6 sm:p-6 py-6 flex bg-third hover:bg-fourth gap-3 sm:gap-3 items-center';
  if (deleteError) {
    className += ' border border-red-600';
  }
  if (isDeleted) {
    className += ' opacity-50';
  }

  let iconContainerClassName = 'flex flex-col justify-center items-center';
  if (deleteMode) {
    iconContainerClassName += ' w-[10%]';
  } else {
    iconContainerClassName += ' w-[1%]';
  }

  const handleDeleteClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    setDeleteError(null);
    setProcessingRead(true);

    if (!deleteMode) {
      return;
    }

    if (!id) {
      setDeleteError('Notification ID is missing');
      return;
    }

    if (!isDeleted) {
      const fetchOptions = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const response : Response = await fetch(`/api/notification/${id}`, fetchOptions);
      if (!response.ok) {
        console.error('Error deleting notification:', response.statusText);
        return;
      }

      setIsDeleted(true);
    }

    setProcessingRead(false);
  }

  const handleClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (isDeleted) {
      return;
    }

    setProcessingRead(true);

    if (!currentRead && id) {
      const fetchOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const response : Response = await fetch(`/api/notification/${id}/read`, fetchOptions);
      if (!response.ok) {
        console.error('Error marking notification as read:', response.statusText);
        return;
      }

      setCurrentRead(true);
    }

    if (url) {
      push(url);
    }
    setProcessingRead(false);
    changeVisibility();
  };

  if (processingRead) {
    return (
      <Link href={''}>
        <div className='w-full px-6 sm:p-6 py-6 flex bg-third gap-3 sm:gap-3 justify-center items-center' id={id}>
          <Spinner size='sm'/>
        </div>
      </Link>
    );
  }

  return (
    <div className={className}>
      <div className={iconContainerClassName}>
        {/* 읽음 처리 여부에 따라 알림 아이콘 색상 변경 */}
        {(!currentRead && !deleteMode )&& (
          <div className='rounded-full p-1 bg-red-600'>
          </div>
        )}
        {(deleteMode && !isDeleted) && (
          <button 
            onClick={handleDeleteClick}
            className='flex items-center justify-center p-1 rounded-lg hover:bg-fourth'
          >
            <Image 
              src={'/icons/delete-red.svg'}
              alt='Delete'
              width={20}
              height={20}
              className='w-10 h-10'
            />
          </button>
        )}
      </div>
      <Link 
        href={''} 
        onClick={handleClick}
      >
        <div className='flex items-center gap-4 flex-grow'>
          <Image 
            src={notifIcon}
            alt='Notification icon'
            width={8} 
            height={8} 
            className='w-7 h-7'
          />
          <div>
            <div className='text-sm line-clamp-1'>
              {message.map((msg) => {
                return msg;
              })}
            </div>
            <p className='text-sm text-first mt-2 text-gray-600'>{formattedDateString}</p>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default NotificationItem;