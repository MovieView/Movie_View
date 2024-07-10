'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

const UserProfile = () => {
  const { data: session } = useSession();

  const handleLogOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className='flex justify-between items-center text-xl gap-4'>
      {session ? (
        <>
          <img
            src={`${session.user?.image}`}
            alt={`${session.user?.name}의 프로필 이미지`}
            className='rounded-full h-16 w-16'
          />
          <button onClick={handleLogOut}>LogOut</button>
        </>
      ) : (
        <>
          <Link href='/login'>
            <button>LogIn</button>
          </Link>
        </>
      )}
    </div>
  );
};

export default UserProfile;
