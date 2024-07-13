'use client';

import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const UserProfile = () => {
  const { data: session } = useSession();
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session && session.user) {
      const userId = session.uid;
      const provider = session.provider;

      getProfileImg(userId, provider);
    }
  }, [session]);

  const getProfileImg = async (userId: string, provider: string) => {
    try {
      const response = await fetch(
        `/api/profile-image?user-id=${userId}&provider=${provider}`
      );

      if (!response.ok) {
        throw new Error('Failed to get filepath');
      }

      const result = await response.json();

      const filePath = result.filepath[0].filepath;

      setProfileImg(filePath);
    } catch (error) {
      console.log(`이미지 가져오기 실패 : ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className='flex justify-between items-center text-xl gap-4'>
      {session ? (
        <>
          <Link href='/my-page'>
            <div className='relative h-9 w-9'>
              {profileImg && !isLoading ? (
                <Image
                  src={profileImg}
                  className='rounded-full'
                  layout='fill'
                  objectFit='cover'
                  alt='user profile image'
                  onLoadingComplete={() => setIsLoading(false)}
                />
              ) : (
                <div
                  className='rounded-full h-full w-full'
                  style={{ backgroundColor: 'transparent' }}
                />
              )}
            </div>
          </Link>
          <button className='text-lg font-medium' onClick={handleLogOut}>
            Logout
          </button>
        </>
      ) : (
        <>
          <Link href={'/login'}>
            <button className='text-lg font-medium'>Login</button>
          </Link>
        </>
      )}
    </div>
  );
};

export default UserProfile;
