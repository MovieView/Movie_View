'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const SocialLogin = () => {
  const isFirstRender = useRef(true);
  const isLoginComplete = useRef(false);
  const { data: session } = useSession();
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const checkUserAndSave = async () => {
      if (session && session.user) {
        const username = session.user.name;
        const filePath = session.user.image;
        const provider = session.provider;
        const userId = session.uid;

        await saveUser(username, filePath, provider, userId);
        setShowAlert(true);
      }
    };

    if (session?.uid && isLoginComplete.current === false) {
      isLoginComplete.current = true;
      checkUserAndSave();
      return;
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;

      return;
    }
  }, [session]);

  const saveUser = async (
    username: string,
    filePath: string,
    provider: string,
    userId: string
  ) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          filePath,
          provider,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save user');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogin = async (provider: string) => {
    await signIn(provider);
  };

  const redirectToHome = () => {
    router.push('/');
    setShowAlert(false);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col justify-center items-center w-80 h-96 gap-8 rounded-xl border-[#B9D7EA] border-solid border-4">
        <button
          className="rounded-2xl border-none bg-slate-300 p-4 w-9/12"
          onClick={() => handleLogin('github')}
        >
          Sign in with Github
        </button>
        <button
          className="rounded-2xl border-none bg-slate-300 p-4 w-9/12"
          onClick={() => handleLogin('kakao')}
        >
          Sign in with Kakao
        </button>
        <button
          className="rounded-2xl border-none bg-slate-300 p-4 w-9/12"
          onClick={() => handleLogin('google')}
        >
          Sign in with Google
        </button>
      </div>
      {/* 로그인 후 알림창 */}
      {showAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg w-80">
            <p className="text-lg">{`${session?.user.name}님 반갑습니다!`}</p>
            <button
              className="mt-2 bg-slate-300 text-white px-4 py-2 rounded-lg"
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
