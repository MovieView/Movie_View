import MovieInfo, { getMovie } from '@/components/MovieDetail/MovieInfo';
import ReviewsList from '@/components/Review/ReviewsList';
import { Suspense } from 'react';

interface IParams {
  params: { id: string };
}

export const API_URL = 'https://api.themoviedb.org/3/movie/';

export async function generateMetadata({ params: { id } }: IParams) {
  const movie = await getMovie(id);
  return {
    title: movie.title,
  };
}

export default async function MovieDetail({ params: { id } }: IParams) {
  return (
    <div>
      <Suspense fallback={<h1>Loading movie info</h1>}>
        <MovieInfo id={id} />
        <ReviewsList movieId={Number(id)} />
      </Suspense>
    </div>
  );
}
