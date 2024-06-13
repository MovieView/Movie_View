"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SocialLogin = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFirstLogin, setIsFirstLogin] = useState(true);
  useEffect(() => {
    const checkUser = async () => {
      if (session && session.user && isFirstLogin) {
        const username = session?.user?.name;
        const filePath = session.user.image;
        const provider = session.provider;
        const userExists = await checkUserExists(username as string);
        if (!userExists) {
          saveUser(username as string, filePath as string, provider as string);
        }
        setIsFirstLogin(false);
      }
    };

    console.log(session);

    checkUser();
  }, [session]);

  const checkUserExists = async (username: string) => {
    try {
      const response = await fetch(`/api/user?username=${username}`);
      if (response.ok) {
        const data = await response.json();
        return data.exists;
      } else {
        throw new Error("Failed to check user existence");
      }
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };

  const saveUser = async (
    username: string,
    filePath: string,
    provider: string
  ) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, filePath, provider }),
      });
      if (!response.ok) {
        throw new Error("Failed to save user");
      }
      alert(`${username}님 반갑습니다!`);
      router.push("/");
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleLogin = async (provider: string) => {
    await signIn(provider);
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
