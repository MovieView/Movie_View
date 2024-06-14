import { InfiniteData, QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import Image from 'next/image';
import React from 'react';


interface LoadingErrorProps {
  refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<InfiniteData<any, unknown>, Error>>;
}

const LoadingError : React.FC<LoadingErrorProps> = ({ refetch }) => {
  return (
    <div className='grow flex flex-col justify-center items-center gap-3 text-black'>
      <Image 
        src={`/icons/fail-red.svg`} 
        alt="error" 
        width={48} 
        height={48}
        className='w-[30%] h-auto md:w-[25%] lg:w-[15%]'
      />
      <p className='text-3xl text-[#f11f2c]'>로딩중 에러 발생</p>
      <button 
        className='bg-[#769FCD] p-2 rounded-lg text-white shadow-md mt-4 font-medium' 
        onClick={async () => {
          await refetch();
        }}
      >
        다시 시도하기
      </button>
    </div>
  );
};

export default LoadingError;