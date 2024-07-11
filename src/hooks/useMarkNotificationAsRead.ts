import { useState } from "react";


const useMarkNotificationAsRead = () => {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const markEveryAsRead = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch('/api/notification/read', {
        method: 'PUT'
      });
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  }

  const markAsRead = async (notificationId: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch(`/api/notification/${notificationId}/read`, {
        method: 'PUT'
      });
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return { 
    markAsRead, 
    markEveryAsRead, 
    isProcessing, 
    error 
  };
};

export default useMarkNotificationAsRead;