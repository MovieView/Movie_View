import clsx from "clsx";
import Image from "next/image";
import NavBarDropMenuContainer from "./NavBarDropMenuContainer";


interface INavBarDropMenuButtonProps {
  visibility: boolean;
  notificationVisibility: boolean;
  changeVisibility: () => void;
  changeNotificationVisibility: () => void;
  disableNotificationVisibility: () => void;
  children?: React.ReactNode;
}

const NavBarDropMenuButton : React.FC<INavBarDropMenuButtonProps> = ({
  visibility,
  notificationVisibility,
  changeVisibility,
  changeNotificationVisibility,
  disableNotificationVisibility,
  children
}) => {
  const handleClick = () => {
    changeVisibility();
    disableNotificationVisibility();
  }

  const className = clsx(
    'flex flex-col items-center justify-center p-1 rounded-lg relative hover:bg-second', 'md:hidden',
    visibility && 'bg-second'
  );

  return (
    <>
      <button className={className} onClick={handleClick}>
        <Image 
          src={'/icons/menu-black.svg'} 
          alt='notification'
          width={8} 
          height={8} 
          className='w-9 h-9'
        />
      </button>
      {visibility && 
        <NavBarDropMenuContainer 
          changeVisibility={changeVisibility}
          changeNotificationVisibility={changeNotificationVisibility}
        />
      }
      {notificationVisibility && children}
    </>
  );
};

export default NavBarDropMenuButton;