import React, { useEffect, useRef, useState } from 'react';
import { RiMore2Line } from 'react-icons/ri';

interface IProps {
  handleEdit: () => void;
  onDelete: (reviewId: string) => void;
  reviewId: string;
}

export default function ReviewDropDownMenu({
  handleEdit,
  onDelete,
  reviewId,
}: IProps) {
  const [isDropMenuOpen, setIsDropMenuOpen] = useState(false);
  const dropMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClose = (e: { target: any }) => {
      if (isDropMenuOpen && !dropMenuRef.current?.contains(e.target))
        setIsDropMenuOpen(false);
    };
    document.addEventListener('click', handleOutsideClose);

    return () => document.removeEventListener('click', handleOutsideClose);
  }, [isDropMenuOpen]);

  return (
    <>
      <div ref={dropMenuRef} className='flex gap-2 flex-end absolute right-3'>
        <button onClick={() => setIsDropMenuOpen(!isDropMenuOpen)}>
          <RiMore2Line className='fill-gray-500 hover:fill-[#769FCD] transition ease-linear duration-300' />
        </button>
      </div>

      {isDropMenuOpen && (
        <div className='flex border absolute right-8 top-7 w-16 flex-col gap-2 text-sm shadow-sm rounded-md bg-white'>
          <button className='hover:bg-[#D6E6F2] py-1' onClick={handleEdit}>
            수정
          </button>
          <button
            className='hover:bg-[#D6E6F2] py-1'
            onClick={() => onDelete(reviewId)}
          >
            삭제
          </button>
        </div>
      )}
    </>
  );
}
