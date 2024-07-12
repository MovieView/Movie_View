import MovieInfo from '@/components/movie/MovieInfo';
import { Suspense } from 'react';
import Spinner from '@/components/common/Spinner';
import { fetchMovie } from '@/app/api/movie/[movieId]/route';

interface IParams {
  params: { movieId: string };
}

export async function generateMetadata({ params: { movieId } }: IParams) {
  const movie = await fetchMovie(movieId);
  return {
    title: movie?.title ? movie.title : 'Unknown',
  };
}

export default async function MovieDetail({ params: { movieId } }: IParams) {
  return (
    <div className='w-full bg-white relative flex flex-col grow'>
      <Suspense fallback={<Spinner size='lg' item={true} />}>
        <MovieInfo movieId={movieId} />
      </Suspense>
    </div>
  );
}
