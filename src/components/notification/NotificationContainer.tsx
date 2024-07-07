import React, { useEffect, useState } from "react";
import NotificationItem from "./NotificationItem";
import Spinner from "../common/Spinner";
import Image from "next/image";


interface IProcessedNotification {
  value: Array<string | React.ReactNode>;
  icon: string;
}

interface INotificationContainerProps {
  visibility: boolean;
  loadNotifications: () => Promise<void>;
  notifications: INotification[] | null;
  isLoading: boolean;
  error: string | null;
}

const NotificationContainer : React.FC<INotificationContainerProps> = ({
  visibility,
  loadNotifications,
  notifications, 
  isLoading, 
  error
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processedNotifications, setProcessedNotifications] = useState<IProcessedNotification[]>([]);

  const fetchError: string | null = error;

  {/* 알림 메시지를 가공하는 함수 */}
  useEffect(() => {
    setIsProcessing(true);
    if (isLoading || !notifications) {
      setIsProcessing(false);
      return;
    }
    try {
      const processedData = notifications.map((item) => {
        const processedData : IProcessedNotification = {
          value: [], // 알림 메시지
          icon: item.icon ? item.icon : '/icons/notification.svg'
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

  if (!visibility) return null;

  return (
    <div 
      className="w-[400px] xl:w-[300px] bg-third absolute top-[50px] right-0 rounded-lg shadow-lg overflow-hidden divide-y divide-second"
      id="notification-container"
    >
      {/* 로딩 중 또는 알림 메시지 처리 중일 때 */}
      {(isLoading || isProcessing) && (
        <div className="my-6">
          <Spinner size="sm"/>
        </div>
      )}
      {/* 알림 로딩 중 에러 발생 시 */}
      {(!isLoading && !isProcessing && (fetchError || processingError)) && (
        <div className="p-4 text-base">
          <p className="text-center text-red-500 font-medium">알림 로딩중 에러 발생</p>
          <button 
            className="block mt-3 mx-auto p-2 rounded-lg bg-first text-white"
            onClick={() => loadNotifications()}
          >
            <Image 
              src={"/icons/refresh-white.svg"}
              alt="Refresh"
              width={8}
              height={8}
              className="w-8 h-8"
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
              icon={notifications[index].icon}
              message={processedNotification.value}
              createdAt={notifications[index].createdAt}
              url={notifications[index].url}
            />
          );
        })
      }
      {/* 알림 메시지가 없을 때 */}
      {(!isProcessing && !isLoading && !fetchError && notifications?.length === 0) && (
        <div className="p-4 text-base flex flex-col items-center justify-center gap-4">
          <Image
            src="/icons/notification-empty-black.svg"
            alt="Notification"
            width={50}
            height={50}
            className="w-10 h-10"
          />
          <p className="text-center text-gray-500 font-medium">새로운 알림이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationContainer;