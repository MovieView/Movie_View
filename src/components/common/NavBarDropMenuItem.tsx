import React from "react";

interface INavBarDropMenuItemProps {
  content: string;
  callback: () => void;
  changeVisibility: () => void;
}

const NavBarDropMenuItem : React.FC<INavBarDropMenuItemProps> = ({content, callback, changeVisibility}) => {
  const handleClick = () => {
    callback();
  }
  return (
    <button 
      className='w-full p-4 px-8 hover:bg-first hover:text-white text-right text-2xl text-black font-semibold' 
      onClick={handleClick}
    >
      {content}
    </button>
  );
}

export default NavBarDropMenuItem;