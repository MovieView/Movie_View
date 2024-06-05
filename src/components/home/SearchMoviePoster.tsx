import React, { useRef } from "react";

import Image from "next/image";
import { DEFAULT_IMAGE_URL } from "@/constants/image";
import Link from "next/link";


type SearchMoviePosterProps = {
  id: number;
  posterUrl: string;
};

const SearchMoviePoster : React.FC<SearchMoviePosterProps> = ({posterUrl, id}) => {
  const thisElement = useRef(null);

  return (
    <button className='w-auto h-auto rounded-lg bg-gray-500 block' ref={thisElement}>
      <Link href={`/detail/${id}`}>
      {posterUrl && (
        <img 
          src={posterUrl}
          alt='movie'
          className='w-full h-full rounded-lg'
        />
      ) }
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
          <img 
            src={DEFAULT_IMAGE_URL}
            alt='no image'
            className='w-full h-full rounded-lg opacity-0'
          />
        </div>
      ) }
      </Link>
    </button>
  );
};

export default SearchMoviePoster;