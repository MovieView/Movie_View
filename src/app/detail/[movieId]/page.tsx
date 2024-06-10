import MovieInfo, { getMovie } from "@/components/movie/MovieInfo";
import ReviewsList from '@/components/Review/ReviewsList';
import { Suspense } from 'react';

interface IParams {
  params: { movieId: string };
}

export const API_URL = 'https://api.themoviedb.org/3/movie/'

export async function generateMetadata({params: {movieId}}: IParams) {
  const movie = await getMovie(movieId)
  return {
    title: movie.title,
  };
};

export default async function MovieDetail({ params: {movieId} }: IParams) {
  return (
    <div className="w-full bg-white relative flex flex-col grow">
      <Suspense fallback={<h1>Loading movie info</h1>}>
        <MovieInfo movieId={movieId} />
      </Suspense>
      <Suspense fallback={<h1>Loading review list</h1>}>
        <ReviewsList movieId={Number(movieId)} />
      </Suspense>
    </div>
  );
};