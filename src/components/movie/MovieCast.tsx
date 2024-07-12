import Image from 'next/image';
import { useState } from 'react';

interface Props {
  name: string;
  profile_path: string;
}

const MovieCast = ({ name, profile_path }: Props) => {
  const [imageLoaded, setImageLoaded] = useState(true);

  const handleImageLoad = () => {
    setImageLoaded(false);
  };

  return (
    <div className='flex flex-col items-center'>
      {profile_path ? (
        <Image
          className={ imageLoaded 
              ? 'rounded-lg shadow-lg w-full h-[7.5rem] animate-pulse flex space-x-4 bg-gray-300'
              : 'rounded-lg shadow-lg w-full h-[7.5rem]' }
          src={`https://image.tmdb.org/t/p/original/${profile_path}`}
          alt={name}
          width={200}
          height={200}
          onLoad={handleImageLoad}
        />
      ) : (
        <div className='w-full h-[7.5rem] bg-slate-500 rounded-lg shadow-lg'></div>
      )}
      <div className='mt-2 text-center text-xs'>{name}</div>
    </div>
  );
};

export default MovieCast;
