'use client';

import { useEffect, useState } from 'react';
import Home from '@/app/(home)/page';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const SocialLogin = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(true);

  useEffect(() => {
    if (session?.user) {
      setShowLoginModal(false);
      router.push('/');
    }
  }, [session, router]);

  const handleLogin = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (err) {
      return;
    }
  };

  const closeModal = () => {
    setShowLoginModal(false);
    router.push('/');
  };

  return (
    <>
      <Home />

      {showLoginModal && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80'
          onClick={closeModal}
        >
          <div className='flex flex-col justify-center items-center w-80 h-96 gap-8 bg-slate-200 rounded-xl'>
            <button
              className='rounded-2xl border-none bg-gray-800 text-white p-4 w-9/12 hover:bg-gray-900 focus:bg-gray-900'
              onClick={() => handleLogin('github')}
            >
              Sign in with Github
            </button>
            <button
              className='rounded-2xl border-none bg-yellow-400 text-black p-4 w-9/12 hover:bg-yellow-500 focus:bg-yellow-500'
              onClick={() => handleLogin('kakao')}
            >
              Sign in with Kakao
            </button>
            <button
              className='rounded-2xl border-none bg-blue-600 text-white p-4 w-9/12 hover:bg-blue-700 focus:bg-blue-700'
              onClick={() => handleLogin('google')}
            >
              Sign in with Google
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SocialLogin;
