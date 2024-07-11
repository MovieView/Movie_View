import { ChangeEvent, FormEvent, useState } from 'react';
import ReviewRating from '../review/ReviewRating';
import { ReviewFormData } from '@/models/review.model';

interface IProps {
  review: ReviewFormData;
  text: string;
  handleCloseForm: () => void;
  setReview: React.Dispatch<React.SetStateAction<ReviewFormData>>;
  onSubmit: (e: FormEvent) => void;
}

export default function ReviewForm({
  review,
  text,
  handleCloseForm,
  setReview,
  onSubmit,
}: IProps) {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReview({ ...review, [name]: value });
  };

  const handleRatingChange = (rating: number) => {
    setReview({ ...review, rating });
  };

  return (
    <>
      <form onSubmit={onSubmit} className='mb-4 flex flex-col gap-3'>
        <div className='flex items-center gap-4 justify-center'>
          <ReviewRating
            rating={review.rating}
            onRatingChange={handleRatingChange}
          />
          <span className='text-2xl font-semibold'>{review.rating}</span>
        </div>
        <input
          className='border px-2 h-10 flex-grow outline-none placeholder:text-sm rounded-md'
          type='text'
          value={review.title}
          name='title'
          placeholder='리뷰 제목을 입력해 주세요.'
          onChange={handleChange}
          required
        />
        <div>
          <textarea
            className='w-full border rounded-md p-2 placeholder:text-sm outline-none h-28 resize-none'
            maxLength={200}
            value={review.content}
            name='content'
            placeholder='리뷰는 최대 200자까지 등록 가능합니다.'
            onChange={handleChange}
            required
          />
          <p className='text-xs text-gray-400'>({review.content.length}/200)</p>
        </div>
        <div className='flex gap-2'>
          <button
            type='submit'
            className='bg-first h-10 text-white p-2 rounded-md flex-1 hover:opacity-70 transition ease-linear duration-300'
          >
            {text}
          </button>
          <button
            type='button'
            onClick={handleCloseForm}
            className='hover:bg-third transition ease-linear duration-300 border h-10 p-2 rounded-md flex-1 hover:opacity-70'
          >
            취소
          </button>
        </div>
      </form>
    </>
  );
}
