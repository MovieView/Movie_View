'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SocialLogin = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (session && session.user) {
      setShowAlert(true);
    }
  }, [session]);

  const handleLogin = async (provider: string) => {
    await signIn(provider);
  };

  const redirectToHome = () => {
    setShowAlert(false);
    router.push('/');
  };

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='flex flex-col justify-center items-center w-80 h-96 gap-8 rounded-xl border-[#B9D7EA] border-solid border-4'>
        <button
          className='rounded-2xl border-none bg-slate-300 p-4 w-9/12'
          onClick={() => handleLogin('github')}
        >
          Sign in with Github
        </button>
        <button
          className='rounded-2xl border-none bg-slate-300 p-4 w-9/12'
          onClick={() => handleLogin('kakao')}
        >
          Sign in with Kakao
        </button>
        <button
          className='rounded-2xl border-none bg-slate-300 p-4 w-9/12'
          onClick={() => handleLogin('google')}
        >
          Sign in with Google
        </button>
      </div>
      {showAlert && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-white p-4 rounded-lg w-80'>
            <p className='text-lg'>{`${session?.user.name}님 반갑습니다!`}</p>
            <button
              className='mt-2 bg-slate-300 text-white px-4 py-2 rounded-lg'
              onClick={redirectToHome}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialLogin;
