'use client';

import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import SearchMoviePoster from '@/components/home/SearchMoviePoster';
import SearchBar from '@/components/home/SearchBar';
import LoadingPing from '@/components/home/LoadingPing';
import LoadingError from '@/components/home/LoadingError';
import LoadMoreButton from '@/components/home/LoadMoreButton';
import { isInViewport } from '@/utils/domUtils';
import useMovieSearch from '@/hooks/useMovieSearch';
import { useSession } from 'next-auth/react';

export default function Home() {
  const getNextPageButton = React.useRef(null);

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
    'w-[90%] md:w-[70%] mx-auto rounded-xl bg-second px-5 py-2 mt-24 text-black flex items-center shadow-md',
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
    const interval = setInterval(() => {
      if (
        getNextPageButton.current &&
        isInViewport(getNextPageButton.current) &&
        !isFetchingNextPage
      ) {
        fetchNextPage().then(() => {
          console.log('Fetched next page');
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchNextPage, isFetchingNextPage]);

  // 모달 관련
  const [showModal, setShowModal] = useState(false);
  const { data: session } = useSession();
  const [nickname, setNickname] = useState<string | undefined>(
    session?.user.name
  );
  const modalShownRef = useRef(false);

  const handleNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setNickname(e.target.value);
  };

  const handleUpdateNickname = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const userId = session?.uid;
      const provider = session?.provider;

      const response = await fetch('/api/nickname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, userId, provider }),
      });

      if (response.ok) {
        localStorage.setItem(`nicknameUpdated_${provider}`, 'true');
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const openModal = () => {
    setShowModal(true);
  };

  // 최초 로그인 시에만 닉네임 설정
  useEffect(() => {
    const provider = session?.provider;
    const nicknameUpdated = localStorage.getItem(`nicknameUpdated_${provider}`);
    if (
      session &&
      session?.user &&
      !nicknameUpdated &&
      !modalShownRef.current
    ) {
      modalShownRef.current = true;
      openModal();
    }
  }, [session]);

  return (
    <div className='w-full bg-white relative flex flex-col grow'>
      <div className='flex flex-col w-full grow'>
        {/* 검색 바 표시하기 */}
        {!isError && !isLoadingError && !isRefetchError && (
          <SearchBar
            searchBarStyle={searchBarStyle}
            searchQuery={searchQuery}
            handleQueryChange={handleQueryChange}
            handleSubmit={handleSubmit}
          />
        )}
        {/* 로딩 중일 경우 */}
        {(isLoading || isRefetching || isPending) && <LoadingPing />}
        {/* 에러 발생 시 */}
        {(isError || isRefetchError || isLoadingError) && (
          <LoadingError refetch={refetch} />
        )}
        {/* 영화 포스터 표시하기 */}
        {isSuccess && !(isLoading || isRefetching) && data && (
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

        {/* 다음 페이지 버튼 */}
        {isSuccess && hasNextPage && !isFetchingNextPage && (
          <LoadMoreButton
            fetchNextPage={fetchNextPage}
            getNextPageButton={getNextPageButton}
          />
        )}
        {isSuccess && isFetchingNextPage && <LoadingPing loadMore={true} />}

        {/* 닉네임 설정 모달 */}
        {showModal && (
          <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
            <form onSubmit={handleUpdateNickname}>
              <div className='bg-white rounded-lg shadow-lg p-6 w-80'>
                <p className='text-lg font-bold mb-4'>
                  사용할 닉네임을 설정해주세요
                </p>
                <input
                  type='text'
                  className='border border-gray-300 rounded-lg px-3 py-2 w-full mb-4 focus:outline-none focus:ring focus:border-second'
                  value={nickname}
                  onChange={handleNickname}
                />
                <div className='flex justify-end'>
                  <button
                    type='button'
                    className='bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2 transition duration-300 ease-in-out hover:bg-gray-400 hover:text-white'
                    onClick={closeModal}
                  >
                    취소
                  </button>
                  <button
                    type='submit'
                    className='bg-second text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-first'
                  >
                    저장
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
