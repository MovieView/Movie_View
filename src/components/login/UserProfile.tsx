'use client';

import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const UserProfile = () => {
  const { data: session } = useSession();
  const [profileImg, setProfileImg] = useState<string | null>(null);

  useEffect(() => {
    if (session && session.user) {
      const userId = session.uid;
      const provider = session.provider;

      const storageKey = `${provider}_profileImg`;

      const cachedProfileImg = localStorage.getItem(storageKey);
      if (cachedProfileImg) {
        setProfileImg(cachedProfileImg);
      } else {
        // 서버에서 프로필 이미지 가져오기
        getProfileImg(userId, provider);
      }
    }
  }, [session]);

  const getProfileImg = async (userId: string, provider: string) => {
    try {
      const response = await fetch(`/api/profile-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          provider,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save user');
      }

      const result = await response.json();
      const filePath = result.filepath[0]['filepath'];
      const storageKey = `${provider}_profileImg`;
      localStorage.setItem(storageKey, filePath);
      setProfileImg(filePath);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className='flex justify-between items-center text-xl gap-4'>
      {session ? (
        <>
          <Link href="/my-page">
            <Image
              src={`${session.user?.image}`}
              className="rounded-full h-9 w-9"
              width={9}
              height={9}
              alt='user profile image'
            />
          </Link>
          <button className="text-lg font-medium" onClick={handleLogOut}>Logout</button>
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
