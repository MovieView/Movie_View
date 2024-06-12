'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import {
  useInfiniteQuery,
  useQueryClient,
  QueryClient,
} from '@tanstack/react-query';

import SearchMoviePoster from '../../components/home/SearchMoviePoster';
import clsx from 'clsx';

// 해당 엘리먼트가 화면에 보이는지 확인 함수
const isInViewport = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

export default function Home(): React.ReactElement {
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [queryClient, setQueryClient] = React.useState<QueryClient>(
    useQueryClient()
  );
  const getNextPageButton = React.useRef<HTMLButtonElement>(null);

  // 영화 리스트 불러오기
  const {
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
  } = useInfiniteQuery(
    {
      queryKey: ['movies'],
      queryFn: async ({ pageParam = 1 }) => {
        let url: string = `api/movie?page=${pageParam}`;
        if (searchQuery) {
          url += `&title=${searchQuery}`;
        }
        const response: Response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return await response.json();
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage: any): number | undefined => {
        if (lastPage.page < lastPage.total_pages && lastPage.page < 10) {
          return lastPage.page + 1;
        }
        return undefined;
      },
      getPreviousPageParam: (firstPage: any): number | undefined => {
        if (firstPage.page > 1) {
          return firstPage.page - 1;
        }
        return undefined;
      },
      maxPages: 10,
      staleTime: Infinity,
    },
    queryClient
  );

  const searchBarStyle = clsx(
    'w-[90%] md:w-[70%] mx-auto rounded-xl bg-[#B9D7EA] px-5 py-2 mt-24 text-black flex items-center shadow-md',
    isSuccess && 'mb-24'
  );

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit: React.MouseEventHandler<HTMLButtonElement> = async (
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    // 검색 전에 캐시를 비워 주기
    queryClient.clear();
    await refetch();
  };

  // 1초마다 다음 페이지 버튼이 화면에 있는지 확인
  useEffect(() => {
    const time: NodeJS.Timeout = setInterval(() => {
      if (
        getNextPageButton.current &&
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
    <div className='w-full bg-white relative flex flex-col grow'>
      <div className='flex flex-col w-full grow'>
        {'검색창 표시하기'}
        {!isError && !isLoadingError && !isRefetchError && (
          <div className={searchBarStyle}>
            <Image src={`/search.svg`} alt='hero' width={24} height={24} />
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
        )}
        {'로딩 중'}
        {(isLoading || isRefetching || isPending) && (
          <div className='grow flex flex-col justify-center items-center text-4xl text-black'>
            <span className='relative flex h-12 w-12'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B9D7EA]'></span>
              <span className='relative inline-flex rounded-full h-12 w-12 bg-[#769FCD]'></span>
            </span>
          </div>
        )}
        {'에러 발생'}
        {(isError || isRefetchError || isLoadingError) && (
          <div className='grow flex flex-col justify-center items-center gap-3 text-black'>
            <Image
              src={`/icons/fail-red.svg`}
              alt='error'
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
        )}
        {'성공적으로 데이터를 불러올 경우, 포스터 표시하기'}
        {isSuccess && !(isLoading || isRefetching) && (
          <div className='grid w-[90%] md:w-[70%] mx-auto mb-10 grid-cols-2 gap-6 lg:grid-cols-3 lg:gap-10 xl:grid-cols-4'>
            {data.pages.map((page) => {
              return page.results.map((movie: any) => {
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
        {isSuccess && hasNextPage && !isFetchingNextPage && (
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
        )}
        {isSuccess && isFetchingNextPage && (
          <div className='flex flex-col justify-center items-center mt-14 mb-24'>
            <span className='relative flex h-12 w-12'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-12 w-12 bg-sky-500'></span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
