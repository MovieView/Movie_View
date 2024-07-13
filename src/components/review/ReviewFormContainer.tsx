import { FormEvent, useState } from 'react';
import ReviewForm from '../review/ReviewForm';
import { IReviewFormData } from '@/models/review.model';
import { useReview } from '@/hooks/useReview';

interface IProps {
  movieId: number;
  sort: string;
  setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  text: string;
  movieTitle: string;
  posterPath: string;
}

export default function ReviewFormContainer({
  movieId,
  setIsFormOpen,
  text,
  sort,
  movieTitle,
  posterPath,
}: IProps) {
  const { addMyReview } = useReview(movieId, sort, movieTitle, posterPath);
  const [reviewData, setReviewData] = useState<IReviewFormData>({
    title: '',
    rating: 0,
    content: '',
  });

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setReviewData({
      title: '',
      rating: 0,
      content: '',
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newReview = {
      movieId,
      title: reviewData.title.trim(),
      content: reviewData.content.trim(),
      rating: reviewData.rating,
    };

    if (newReview.title.length === 0 || newReview.content.length === 0) {
      window.alert('리뷰 제목과 내용은 최소 한 글자 이상 입력해 주세요.');
      return;
    }

    addMyReview(
      newReview.movieId,
      newReview.title,
      newReview.rating,
      newReview.content
    );

    setReviewData({
      title: '',
      rating: 0,
      content: '',
    });

    setIsFormOpen(false);
  };

  return (
    <ReviewForm
      text={text}
      review={reviewData}
      handleCloseForm={handleCloseForm}
      setReview={setReviewData}
      onSubmit={handleSubmit}
    />
  );
}
