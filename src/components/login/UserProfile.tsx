'use client';

import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const UserProfile = () => {
  const { data: session } = useSession();
  const [showAlert, setShowAlert] = useState(false);

  const handleLogOut = async () => {
    await signOut({ callbackUrl: '/' });

    setShowAlert(true);
  };

  const redirectToHome = () => {
    setShowAlert(false);
  };

  return (
    <div className="flex justify-between items-center text-xl gap-4">
      {session ? (
        <>
          <Image
            src={`${session.user?.image}`}
            className="rounded-full h-9 w-9"
            width={9}
            height={9}
            alt='user profile image'
          />
          {/* 로그아웃 알림창 */}
          {showAlert && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-4 rounded-lg w-80">
                <p className="text-lg">{`${session.user.name}님 안녕히 가세요!`}</p>
                <button
                  className="mt-2 bg-slate-300 text-white px-4 py-2 rounded-lg"
                  onClick={redirectToHome}
                >
                  확인
                </button>
              </div>
            </div>
          )}
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
