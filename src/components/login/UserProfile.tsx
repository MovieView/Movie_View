"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

const UserProfile = () => {
  const { data: session } = useSession();

  return (
    <div className="flex justify-between items-center text-xl gap-4">
      {session ? (
        <>
          <img
            src={`${session.user?.image}`}
            className="rounded-full h-16 w-16"
          />
          <button onClick={() => signOut({ callbackUrl: "/" })}>LogOut</button>
        </>
      ) : (
        <>
          <img className="bg-slate-300 rounded-full h-16 w-16" />
          <Link href={"/login"}>
            <button>LogIn</button>
          </Link>
        </>
      )}
    </div>
  );
};

export default UserProfile;
