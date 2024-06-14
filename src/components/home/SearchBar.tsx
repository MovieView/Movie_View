import Image from 'next/image';
import React from 'react';


interface SearchBarProps {
  searchBarStyle: string;
  searchQuery: string;
  handleQueryChange: (e : React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: React.MouseEventHandler<HTMLButtonElement>;
}

const SearchBar : React.FC<SearchBarProps> = ({
  searchBarStyle,
  searchQuery,
  handleQueryChange,
  handleSubmit,
}) => {
  return(
    <div className={searchBarStyle}>
      <Image 
        src={`/search.svg`} 
        alt='hero' 
        width={24} 
        height={24} 
      />
      <input 
        type='text' 
        placeholder='영화 검색하기' 
        className='w-full text-lg p-3 bg-transparent placeholder:font-medium placeholder:text-gray-500 outline-none'
        value={searchQuery}
        onChange={handleQueryChange}
      /> 
      <button 
        className='bg-[#769FCD] p-2 rounded-lg text-white shadow-md' 
        onClick={handleSubmit}
      >
        Search
      </button>
    </div>
  )
};

export default SearchBar;