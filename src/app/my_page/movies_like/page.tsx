import { Suspense } from 'react';
import Spinner from '@/components/Common/Spinner';
import MoviesLikeList from '@/components/myPage/MoviesLikeList';

export async function generateMetadata() {
  return {
    title: 'MyPage_movieLikes',
  };
};

export default async function MyMoviesLike() {
  return (
    <div className='w-full bg-white relative flex flex-col grow'>
      <Suspense fallback={<Spinner size='lg' item={true} />}>
        <MoviesLikeList />
      </Suspense>
    </div>
  );
};
