import clsx from 'clsx';
import React from 'react';


interface LoadingPingProps {
  loadMore?: boolean;
};

const LoadingPing : React.FC<LoadingPingProps> = ({loadMore}) => {
  const parentBoxStyle = clsx(
    'flex', 'flex-col', 'justify-center', 'items-center',
    loadMore ? 'mt-14 mb-24' : 'grow text-4xl text-black',
  );

  return (
    <div className={parentBoxStyle}>
      <span className='relative flex h-12 w-12'>
        <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-second'></span>
        <span className='relative inline-flex rounded-full h-12 w-12 bg-first'></span>
      </span>
    </div>
  );
};

export default LoadingPing;