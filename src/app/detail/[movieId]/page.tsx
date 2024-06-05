import ReviewsList from '@/components/Review/ReviewsList';

interface Props {
  params: {
    movieId: number;
  };
}

export default function DetailPage({ params: { movieId } }: Props) {
  return (
    <div>
      <ReviewsList movieId={movieId} />
    </div>
  );
}
