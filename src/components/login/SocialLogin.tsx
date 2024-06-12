"use client";

import { insertUserData } from "@/app/api/auth/user";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SocialLogin = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFirstLogin, setIsFirstLogin] = useState(true);

  // useEffect(() => {
  //   const userId = BigInt(Date.now());

  //   if (session && session.user && session.provider && isFirstLogin) {
  //     alert(`${session.user.name}님 반갑습니다!`);
  //     router.push("/");
  //     setIsFirstLogin(false);

  //   }
  // }, [session, isFirstLogin, router]);

  // const handleLogin = async (provider: string) => {
  //   setIsFirstLogin(true);
  //   const result = await signIn(provider);
  //   if (result?.error) {
  //     console.error(result.error);
  //   }
  // };

  useEffect(() => {
    const handleLoginSuccess = async () => {
      if (session && session.user && session.provider && isFirstLogin) {
        alert(`${session.user.name}님 반갑습니다!`);
        router.push("/");
        setIsFirstLogin(false);
        await insertUserData(session);
      }
    };

    handleLoginSuccess();
  }, [session, isFirstLogin, router]);

  const handleLogin = async (provider: string) => {
    setIsFirstLogin(true);
    const result = await signIn(provider);
    if (result?.error) {
      console.error(result.error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col justify-center items-center w-80 h-1/2 gap-4 rounded-xl border-slate-300 border-solid border-4">
        <button
          className="border-solid rounded-2xl border-4 border-slate-300 p-4 w-9/12"
          onClick={() => handleLogin("github")}
        >
          Sign in with Github
        </button>

        <button
          className="border-solid rounded-2xl border-4 border-slate-300 p-4 w-9/12"
          onClick={() => handleLogin("kakao")}
        >
          Sign in with Kakao
        </button>
        <button
          className="border-solid rounded-2xl border-4 border-slate-300 p-4 w-9/12"
          onClick={() => handleLogin("naver")}
        >
          Sign in with Naver
        </button>
      </div>
    </div>
  );
};

export default SocialLogin;
