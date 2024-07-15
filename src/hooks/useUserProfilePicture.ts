import { useCallback, useState } from "react";


const useUserProfilePicture = () => {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getProfilePicture = async (userId: string, provider: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/profile-image?user-id=${userId}&provider=${provider}`
      );

      if (!response.ok) {
        throw new Error('Failed to get filepath');
      }

      const result = await response.json();

      const filePath = result.filepath[0].filepath;

      setProfilePicture(filePath);
    } catch (error) {
      setError('이미지 가져오기 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return { profilePicture, getProfilePicture, isLoading, error };
};

export default useUserProfilePicture;