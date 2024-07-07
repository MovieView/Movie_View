import { formatDate } from "@/utils/notificationUtils";
import Image from "next/image"
import Link from "next/link";
import React from "react";


interface INotificationItemProps {
  icon?: string;
  url?: string;
  createdAt: string;
  message: (string | React.ReactNode)[];
}

const NotificationItem : React.FC<INotificationItemProps> = ({ icon, url, message, createdAt }) => {
  const notifIcon = icon ? icon : '/icons/notification.svg';
  const formattedDateString = formatDate(createdAt);

  return (
    <Link href={url ? url : ''}>
      <div className="w-full p-4 py-5 flex items-center gap-4">
        <Image 
          src={notifIcon}
          alt="Notification icon"
          width={8} 
          height={8} 
          className="w-7 h-7"
        />
        <div className="text-sm">
          {message.map((msg) => {
            return msg;
          })}
          <p className='text-sm text-first mt-2 text-gray-600'>{formattedDateString}</p>
        </div>
      </div>
    </Link>
  )
}

export default NotificationItem;