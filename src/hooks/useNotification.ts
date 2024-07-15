'use client'
 
import { usePathname } from 'next/navigation'
import { splitStringWithPlaceholders } from "@/utils/notificationUtils";
import { useCallback, useEffect, useState } from "react";


const useNotification = (navbar?: boolean) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notification, setNotification] = useState<INotification[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);

  const location: string = usePathname();

  const processNotification = (data : any) => {
    const processedData : INotification[] = data.map((item : any) => {
      const templateData = JSON.parse(item.template_data);
      const splitMessage = splitStringWithPlaceholders(item.template_message);
      const processedData : INotification = {
        value: '', 
        createdAt: item.created_at, 
        read: item.checked, 
        id: item.id
      };


      if (item.url_template) {
        let url = item.url_template;
        for (const key in templateData) {
          url = url.replace(`{${key}}`, templateData[key]);
        }
        processedData.url = url;
      }

      if (splitMessage) {
        processedData.value = [];
        for (let i = 0; i < splitMessage.length; i++) {
          const substringObject : {value: string, bold?: boolean} = { value: '' };

          if (
            (splitMessage[i].startsWith('!{') || splitMessage[i].startsWith('{')) 
            && splitMessage[i].endsWith('}')
          ) {
            let key = splitMessage[i].startsWith('!') ? splitMessage[i].slice(2, -1) : splitMessage[i].slice(1, -1);
            substringObject.value = templateData[key];

            if (splitMessage[i].startsWith('!')) {
              substringObject.bold = true;
            }
          } else {
            substringObject.value = splitMessage[i];
          }

          processedData.value.push(substringObject);
        }
      } else {
        processedData.value = item.template_message;
      }
      
      if (templateData.icon) {
        processedData.icon = templateData.icon;
      }
      return processedData;
    });

    setNotification(processedData);
  };

  const firstPage = () => {
    setCurrentPage(1);
  };

  const lastPage = () => {
    setCurrentPage(totalPage);
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const fetchNotification = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotification(null);

    const url = '/api/notification?page=' + currentPage + (navbar ? '&quantity=navbar' : '');
    try {
      const response : Response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch notification');
      }
      const data = await response.json();
      processNotification(data.rows);
      setUnreadCount(data.unreadCount);
      setTotalPage(data.totalPage);
    } catch (err : any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, navbar]);

  useEffect(() => {
    fetchNotification();
  }, [location, currentPage, fetchNotification]);

  return { 
    notification, 
    isLoading, 
    error, 
    fetchNotification,
    unreadCount,
    totalPage,
    currentPage,
    firstPage,
    lastPage,
    previousPage,
    nextPage
  };
};

export default useNotification;