'use client';

import useUserProfilePicture from '@/hooks/useUserProfilePicture';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect } from 'react';
import Spinner from '../common/Spinner';

const UserProfile = () => {
  const { data: session } = useSession();
  const { profilePicture, getProfilePicture, isLoading, error } =
    useUserProfilePicture();

  const chooseImageForDisplay = () => {
    if (!isLoading) {
      if (error) {
        return <img src={'/default-profile.png'} alt='Profile' className='w-full h-full object-cover rounded-full' />;
      } else {
        if (profilePicture) {
          return <img src={profilePicture} alt='Profile' className='w-full h-full object-cover rounded-full' />;
        } else {
          return <img src={'/default-profile.png'} alt='Profile' className='w-full h-full object-cover rounded-full' />;
        }
      }
    }
    return <Spinner size='xs'/>;
  }

  useEffect(() => {
    if (session && session.user) {
      const userId = session.uid;
      const provider = session.provider;

      getProfilePicture(userId, provider);
    }
  }, [session]);

  const handleLogOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className='flex justify-between items-center text-xl gap-4'>
      {session ? (
        <>
          <Link href='/my-page'>
            <div className='relative h-9 w-9'>
              {chooseImageForDisplay()}
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
