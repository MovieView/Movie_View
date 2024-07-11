import { SimilarMovie } from '@/models/movie.model';
import React from 'react';

interface Props {
  similarMovies: SimilarMovie[];
}
const MovieSimilar = ({ similarMovies }: Props) => {
  return (
    <div className='mx-auto max-w-5xl mt-6 lg:px-8 sm:px-6'>
      <div className='font-bold text-lg'>비슷한 영화</div>
    </div>
  );
};

export default MovieSimilar;
