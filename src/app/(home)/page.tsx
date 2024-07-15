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
import RecentReview from '@/components/recentReview/RecentReview';
import { useRecentReviews } from '@/hooks/useRecentReviews';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import Spinner from '@/components/common/Spinner';

export default function Home() {
  const getNextPageButton = React.useRef(null);

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

  const {
    recentReviews,
    isRecentReviewsError,
    isRecentReviewsPending,
    isRecentReviewsFetching,
    recentReviewsRefetch,
  } = useRecentReviews();

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
    queryClient.clear();
    await refetch();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        getNextPageButton.current &&
        isInViewport(getNextPageButton.current) &&
        !isFetchingNextPage
      ) {
        fetchNextPage().then(() => {
          return;
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchNextPage, isFetchingNextPage]);

  const [showModal, setShowModal] = useState(false);
  const { data: session } = useSession();
  const [nickname, setNickname] = useState<string | undefined>(
    session?.user.name
  );
  const modalShownRef = useRef(false);

  interface INicknameForm {
    nickname: string;
  }

  const {
    handleSubmit: handleSubmitForm,
    register,
    formState: { errors },
    setValue,
  } = useForm<INicknameForm>();

  const handleNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  const handleUpdateNickname = async (data: INicknameForm) => {
    try {
      const userId = session?.uid;
      const provider = session?.provider;
      const nickname = data.nickname;

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
      return;
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const openModal = () => {
    setShowModal(true);
  };

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
      setValue('nickname', session?.user.name);
      openModal();
    }
  }, [session]);

  return (
    <div className='w-full bg-white relative flex flex-col grow'>
      <div className='flex flex-col w-full grow'>
        {!isError && !isLoadingError && !isRefetchError && (
          <SearchBar
            searchBarStyle={searchBarStyle}
            searchQuery={searchQuery}
            handleQueryChange={handleQueryChange}
            handleSubmit={handleSubmit}
          />
        )}

        {isRecentReviewsError && (
          <LoadingError refetch={recentReviewsRefetch} />
        )}
        {isRecentReviewsPending ||
          (isRecentReviewsFetching && <Spinner size='xs' />)}

        {!(isRecentReviewsPending || isRecentReviewsFetching) &&
          recentReviews && (
            <RecentReview reviews={recentReviews.reviews.slice(0, 6)} />
          )}

        {(isLoading || isRefetching || isPending) && <LoadingPing />}
        {(isError || isRefetchError || isLoadingError) && (
          <LoadingError refetch={refetch} />
        )}

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

        {isSuccess && hasNextPage && !isFetchingNextPage && (
          <LoadMoreButton
            fetchNextPage={fetchNextPage}
            getNextPageButton={getNextPageButton}
          />
        )}

        {isSuccess && isFetchingNextPage && <LoadingPing loadMore={true} />}

        {showModal && (
          <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
            <form onSubmit={handleSubmitForm(handleUpdateNickname)}>
              <div className='bg-white rounded-lg shadow-lg p-6 w-80'>
                <p className='text-lg font-bold mb-4'>
                  사용할 닉네임을 설정해주세요
                </p>
                <input
                  type='text'
                  className='border border-gray-300 rounded-lg px-3 py-2 w-full mb-4 focus:outline-none focus:ring focus:border-second'
                  {...register('nickname', {
                    required: '닉네임은 필수입니다.',
                    minLength: {
                      value: 2,
                      message: '닉네임은 최소 2자 이상이어야 합니다.',
                    },
                  })}
                />
                {errors.nickname && (
                  <p className='text-red-600 mb-4'>{errors.nickname.message}</p>
                )}
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
