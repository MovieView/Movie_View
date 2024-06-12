import { FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult } from "@tanstack/react-query";
import React from "react";


interface LoadMoreButtonProps {
  fetchNextPage: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<any, unknown>, Error>>;
  getNextPageButton: React.RefObject<HTMLButtonElement>;
}

const LoadMoreButton : React.FC<LoadMoreButtonProps> = ({
  fetchNextPage,
  getNextPageButton
}) => {
  return (
    <div className='mt-14 mb-24'>
      <button 
        className='w-[90%] md:w-[70%] mx-auto bg-[#769FCD] text-white p-3 rounded-lg shadow-md mx-auto block'
        onClick={async () => {
          await fetchNextPage();
        }}
        ref={getNextPageButton}
      >
        다음 페이지 불러오기
      </button>
    </div>
  );
};

export default LoadMoreButton;