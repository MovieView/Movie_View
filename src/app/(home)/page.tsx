'use client'

import React, { useEffect } from 'react';
import clsx from 'clsx';

import SearchMoviePoster from '@/components/home/SearchMoviePoster';
import SearchBar from '@/components/home/SearchBar';
import LoadingPing from '@/components/home/LoadingPing';
import LoadingError from '@/components/home/LoadingError';
import LoadMoreButton from '@/components/home/LoadMoreButton';
import { isInViewport } from '@/utils/domUtils';
import useMovieSearch from '@/hooks/useMovieSearch';


export default function Home() : React.ReactElement {
  const getNextPageButton = React.useRef<HTMLButtonElement>(null);
  // 영화 리스트 불러오기
  const {
    searchQuery,
    setSearchQuery,
    queryClient,
    data, 
    hasNextPage,
    fetchNextPage,
    isError,
    isLoading,
    isLoadingError,
    isFetchingNextPage,
    isPending,
    isRefetching,
    isRefetchError,
    isSuccess,
    refetch,
  } = useMovieSearch();

  const searchBarStyle = clsx(
    'w-[90%] md:w-[70%] mx-auto rounded-xl bg-[#B9D7EA] px-5 py-2 mt-24 text-black flex items-center shadow-md',
    (isSuccess) && 'mb-24'
  )

  const handleQueryChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit : React.MouseEventHandler<HTMLButtonElement> = async (e : React.MouseEvent) => {
    e.preventDefault();
    // 검색 전에 캐시를 비워 주기
    queryClient.clear();
    await refetch();
  };

  // 1초마다 다음 페이지 버튼이 화면에 있는지 확인
  useEffect(() => {
    const time : NodeJS.Timeout = setInterval(() => {
      if (getNextPageButton.current && 
        isInViewport(getNextPageButton.current) && 
        !isFetchingNextPage
      ) {
        fetchNextPage().then(() => {
          console.log('Fetched next page'); // Debugging
        });
      }
    }, 1000);

    return () => {
      clearInterval(time);
    };
  }, []);

  return (
    <div className="w-full bg-white relative flex flex-col grow">
      <div className='flex flex-col w-full grow'>
        {"검색창 표시하기"}
        {(!isError && !isLoadingError && !isRefetchError) && (
          <SearchBar 
            searchBarStyle={searchBarStyle}
            searchQuery={searchQuery}
            handleQueryChange={handleQueryChange}
            handleSubmit={handleSubmit}
          />
        )}
        {"로딩 중"}
        {(isLoading || isRefetching || isPending) && (
          <LoadingPing />
        )}
        {"에러 발생"}
        {(isError || isRefetchError || isLoadingError) && (
          <LoadingError refetch={refetch} />
        )}
        {"성공적으로 데이터를 불러올 경우, 포스터 표시하기"}
        {(isSuccess && !(isLoading || isRefetching) && data) && (
          <div className='grid w-[90%] md:w-[70%] mx-auto mb-10 grid-cols-2 gap-6 lg:grid-cols-3 lg:gap-10 xl:grid-cols-4'>
            {data.pages.map((page) => {
              return page.results.map((movie : any) => {
                return (
                  <SearchMoviePoster 
                    key={movie.id} 
                    id={movie.id} 
                    posterUrl={movie.posterUrl}
                  />
                );
              });
            })}
          </div>
        )}

        {"페이지네이션 관련 컴포넌트"}
        {"다음 페이지 버튼 표시하기"}
        {(isSuccess && hasNextPage && !isFetchingNextPage) && (
          <LoadMoreButton
            fetchNextPage={fetchNextPage}
            getNextPageButton={getNextPageButton}
          />
        )}
        {"다음 페이지 로딩 중"}
        {(isSuccess && isFetchingNextPage) && (
          <LoadingPing loadMore={true} />
        )}
      </div>
    </div>
  );
}