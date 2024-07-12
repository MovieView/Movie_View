import React, { useEffect, useState } from 'react';
import NotificationItem from './NotificationItem';
import Spinner from '../common/Spinner';
import Image from 'next/image';
import NotificationContainerPagination from './NotificationContainerPagination';
import NotificationContainerHeader from './NotificationContainerHeader';


interface IProcessedNotification {
  id: string;
  value: Array<string | React.ReactNode>;
  icon: string;
  read: boolean;
  createdAt: string;
  url: string | null;
}

interface INotificationContainerProps {
  visibility: boolean;
  changeVisibility: () => void;
  loadNotifications: () => Promise<void>;
  notifications: INotification[] | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPage: number;
  turnFirstPage: () => void;
  turnLastPage: () => void;
  turnNextPage: () => void;
  turnPreviousPage: () => void;
  isMarkProcessing: boolean;
  markError: string | null;
  markEveryAsRead: () => Promise<void>;
}

const NotificationContainer : React.FC<INotificationContainerProps> = ({
  visibility,
  changeVisibility,
  loadNotifications,
  notifications, 
  isLoading, 
  error,
  currentPage,
  totalPage,
  turnFirstPage,
  turnLastPage,
  turnNextPage,
  turnPreviousPage,
  isMarkProcessing,
  markError,
  markEveryAsRead
}) => {
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processedNotifications, setProcessedNotifications] = useState<IProcessedNotification[]>([]);

  const fetchError: string | null = error;

  const markEveryNotificationAsRead = () => {
    (async () => {
      await markEveryAsRead();
      setSettingsOpen(false);
      await loadNotifications();
    })();
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
  };

  let parentContainerClassName = 'h-dvh sm:h-auto w-full sm:w-[400px] bg-white fixed sm:absolute top-[80px] sm:top-[50px] right-0 rounded-lg shadow-lg overflow-hidden overflow-y-auto'
  if (!visibility) {
    parentContainerClassName += ' hidden';
  }

  /* 알림 메시지를 가공하는 함수 */
  useEffect(() => {
    setIsProcessing(true);
    if (isLoading || !notifications) {
      setIsProcessing(false);
      return;
    }

    try {
      /* 각 알림 메시지를 가공하여 processedNotifications에 저장 */
      const processedData : IProcessedNotification[] = notifications.map((item) => {
        const processedData : IProcessedNotification = {
          value: [], // 알림 메시지
          icon: item.icon ? item.icon : '/icons/notification.svg',
          read: item.read,
          id: item.id,
          createdAt: item.createdAt,
          url: item.url ? item.url : null
        };

        if (Array.isArray(item.value)) {
          item.value.forEach((subItem, index) => {
            if (index > 0) processedData.value.push(' ');

            if (typeof subItem === 'string') {
              processedData.value.push(subItem);
            } else {
              const { value, bold } = subItem;
              processedData.value.push(
                <span className={bold ? 'font-semibold' : ''}>{value}</span>
              );
            }
          });
        } else {
          if (typeof item.value === 'string') {
            processedData.value.push(item.value);
          }
        }

        return processedData;
      });

      setProcessedNotifications(processedData);
      setIsProcessing(false);
    } catch (e: any) {
      setProcessingError(e.message);
      setIsProcessing(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!visibility) {
      setSettingsOpen(false);
      setDeleteMode(false);
    }
  }, [visibility]);

  return (
    <div 
      className={parentContainerClassName}
      id='notification-container'
    >
      <NotificationContainerHeader
        closeContainerCallback={changeVisibility}
        toggleSettingsCallback={toggleSettings}
      />
      {/* 알림 설정 */}
      {settingsOpen && (
        <div className='w-full flex items-stretch text-base text-black bg-fourth font-medium'>
          {(isMarkProcessing) && (
            <div className='w-full p-4 flex flex-col items-center justify-center'>
              <span className='relative flex h-5 w-5'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-second'></span>
                <span className='relative inline-flex rounded-full h-5 w-5 bg-first'></span>
              </span>
            </div>
          )} 
          {(!isMarkProcessing && !markError) && (
            <button 
              className='w-full p-4 hover:bg-first hover:text-white'
              onClick={markEveryNotificationAsRead}
            >
              전체 읽음 처리
            </button>
          )}
          {(!isMarkProcessing && markError) && (
            <button 
              className='w-full p-4 hover:bg-first hover:text-white border border-red-500'
              onClick={markEveryNotificationAsRead}
            >
              전체 읽음 처리
            </button>
          )}
          <button 
            className='w-full p-4 hover:bg-first hover:text-white' 
            onClick={toggleDeleteMode}
          >
            알림 삭제
          </button>
        </div>
      )}
      {/* 로딩 중 또는 알림 메시지 처리 중일 때 */}
      {(isLoading || isProcessing) && (
        <div className='my-6'>
          <Spinner size='sm'/>
        </div>
      )}
      {/* 알림 로딩 중 에러 발생 시 */}
      {(!isLoading && !isProcessing && (fetchError || processingError)) && (
        <div className='p-4 text-base'>
          <p className='text-center text-red-500 font-medium'>알림 로딩중 에러 발생</p>
          <button 
            className='block mt-3 mx-auto p-2 rounded-lg bg-first text-white'
            onClick={() => loadNotifications()}
          >
            <Image 
              src={'/icons/refresh-white.svg'}
              alt='Refresh'
              width={8}
              height={8}
              className='w-8 h-8'
            />
          </button>
        </div>
      )}
      {/* 알림 메시지가 있을 때 */}
      {
        (
          !isProcessing && !isLoading && 
          (!fetchError && !processingError) 
          && notifications?.length && processedNotifications?.length
        ) && 
        processedNotifications?.map((processedNotification, index) => {
          return (
            <NotificationItem 
              key={index}
              icon={processedNotification.icon}
              read={processedNotification.read}
              id={processedNotification.id}
              message={processedNotification.value}
              createdAt={processedNotification.createdAt}
              url={processedNotification.url}
              deleteMode={deleteMode}
              changeVisibility={changeVisibility}
            />
          );
        })
      }
      {/* 알림 메시지가 없을 때 */}
      {(!isProcessing && !isLoading && !fetchError && notifications?.length === 0) && (
        <div className='p-4 text-base flex flex-col items-center justify-center gap-4'>
          <Image
            src='/icons/notification-empty-black.svg'
            alt='Notification'
            width={50}
            height={50}
            className='w-6 h-6'
          />
          <p className='text-center text-gray-500 font-medium'>새로운 알림이 없습니다.</p>
        </div>
      )}
      {
        totalPage > 1 &&
        (<NotificationContainerPagination 
          currentPage={currentPage}
          totalPage={totalPage}
          turnFirstPage={turnFirstPage}
          turnLastPage={turnLastPage}
          turnNextPage={turnNextPage}
          turnPreviousPage={turnPreviousPage}
        />)
      }
    </div>
  );
};

export default NotificationContainer;