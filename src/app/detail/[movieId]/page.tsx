import ReviewsList from '@/components/Review/ReviewsList';
import MovieInfo, { getMovie } from '@/components/Movie/MovieInfo';
import { Suspense } from 'react';
import Loading from './loading';

interface IParams {
  params: { movieId: string };
}

export async function generateMetadata({ params: { movieId } }: IParams) {
  const movie = await getMovie(movieId);
  return {
    title: movie.title,
  };
}

export default async function MovieDetail({ params: { movieId } }: IParams) {
  return (
    <div className='w-full bg-white relative flex flex-col grow'>
      <Suspense fallback={<Loading />}>
        <MovieInfo movieId={movieId} />
        <ReviewsList movieId={Number(movieId)} />
      </Suspense>
    </div>
  );
}
