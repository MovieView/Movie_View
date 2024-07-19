import React from "react";
import NavBarDropMenuItem from "./NavBarDropMenuItem";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";


interface INavBarDropMenuContainerProps {
  changeVisibility: () => void;
  changeNotificationVisibility: () => void;
}

const NavBarDropMenuContainer : React.FC<INavBarDropMenuContainerProps> = ({
  changeVisibility,
  changeNotificationVisibility
}) => {
  const router = useRouter();
  const {data: session} = useSession();

  const handleLogOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="w-full bg-fourth absolute top-[80px] right-0 z-10 h-dvh flex flex-col items-stretch gap-4 py-8 md:hidden">
      <NavBarDropMenuItem content="프로필 변경" callback={() => {
        router.push('/my-page');
        changeVisibility();
      }} changeVisibility={changeVisibility}/>
      <NavBarDropMenuItem 
        content="알림" 
        callback={changeNotificationVisibility} 
        changeVisibility={changeVisibility}
      />
      {session && 
        (<NavBarDropMenuItem 
          content="로그아웃" 
          callback={handleLogOut} 
          changeVisibility={changeVisibility}/>
        )
      }
      {!session && (
        <NavBarDropMenuItem 
          content="로그인" 
          callback={() => {router.push('/login');}} 
          changeVisibility={changeVisibility}
        />
      )}
    </div>
  );
};

export default NavBarDropMenuContainer;