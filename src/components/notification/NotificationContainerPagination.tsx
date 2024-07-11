import React from 'react';
import Image from 'next/image';


interface NotificationContainerPaginationProps {
  currentPage: number;
  totalPage: number;
  turnFirstPage: () => void;
  turnLastPage: () => void;
  turnNextPage: () => void;
  turnPreviousPage: () => void;
}


const NotificationContainerPagination : React.FC<NotificationContainerPaginationProps> = ({
  currentPage,
  totalPage,
  turnFirstPage,
  turnLastPage,
  turnNextPage,
  turnPreviousPage
}) => {
  if (totalPage === 1 || totalPage === 0) return null;
  return (
    <div className='w-full flex items-center justify-center gap-4 p-4 bg-fourth'>
      <button 
        className='p-2 rounded-lg bg-second text-white hover:bg-fourth'
        onClick={turnFirstPage}
      >
        <Image 
          src={'/icons/first-page-black.svg'}
          alt='First page'
          width={8}
          height={8}
          className='w-6 h-6'
        />
      </button>
      <button 
        className='p-2 rounded-lg bg-second text-white hover:bg-fourth'
        onClick={turnPreviousPage}
      >
        <Image 
          src={'/icons/previous-page-black.svg'}
          alt='Previous page'
          width={8}
          height={8}
          className='w-6 h-6'
        />
      </button>
      <div className='text-base font-medium'>
        <p>{currentPage} / {totalPage}</p>
      </div>
      <button 
        className='p-2 rounded-lg bg-second text-white hover:bg-fourth'
        onClick={turnNextPage}
      >
        <Image 
          src={'/icons/next-page-black.svg'}
          alt='Next page'
          width={8}
          height={8}
          className='w-6 h-6'
        />
      </button>
      <button 
        className='p-2 rounded-lg bg-second text-white hover:bg-fourth'
        onClick={turnLastPage}
      >
        <Image 
          src={'/icons/last-page-black.svg'}
          alt='Last page'
          width={8}
          height={8}
          className='w-6 h-6'
        />
      </button>
    </div>
  )
};

export default NotificationContainerPagination;