import React from "react";

import Image from "next/image";
import Link from "next/link";


interface SearchMoviePosterProps {
  id: number;
  posterUrl: string;
}

const SearchMoviePoster : React.FC<SearchMoviePosterProps> = ({posterUrl, id}) => {
  return (
    <button className='w-auto h-auto rounded-lg bg-gray-500 block'>
      <Link href={`/detail/${id}`}>
      {/* 포스터가 있을 경우 */}
      {posterUrl && (
        <img 
          src={posterUrl}
          alt='movie'
          className='w-full h-full rounded-lg'
        />
      ) }
      {/* 포스터가 없을 경우 */}
      {!posterUrl && (
        <div className="w-full h-full relative">
          <div className="absolute w-full h-full flex flex-col items-center justify-center">
            <Image
              src={'/icons/movie-white.svg'}
              alt='no image'
              width={0}
              height={0}
              className="w-24 h-24"
            />
            <p className='text-white'>No Image</p>
          </div>
          <Image
            src={'/default_movie_poster.jpeg'}
            alt='no image'
            height={0}
            width={0}
            className='w-full h-full rounded-lg opacity-0'
          />
        </div>
      )}
      </Link>
    </button>
  );
};

export default SearchMoviePoster;