import { ChangeEvent, FormEvent, useState } from 'react';
import ReviewRating from './ReviewRating';

interface IProps {
  movieId: number;
  onAddReview: (
    movieId: number,
    title: string,
    rating: number,
    content: string
  ) => void;
}

export default function ReviewForm({ movieId, onAddReview }: IProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'title') {
      setTitle(value);
    }
  };

  const handleRatingChange = (rating: number) => {
    setRating(rating);
  };

  const handleChangeContent = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setTitle('');
    setContent('');
    setRating(0);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newReview = {
      movieId,
      title: title.trim(),
      content: content.trim(),
      rating,
    };

    if (newReview.title.length === 0 || newReview.content.length === 0) {
      window.alert('리뷰 제목과 내용은 최소 한 글자 이상 입력해 주세요.');
      return;
    }
    onAddReview(
      newReview.movieId,
      newReview.title,
      newReview.rating,
      newReview.content
    );

    setTitle('');
    setContent('');
    setRating(0);
    setIsFormOpen(false);
  };

  return (
    <div className='w-full max-w-3xl mx-auto'>
      {!isFormOpen && (
        <div className='flex mb-4' onClick={() => setIsFormOpen(true)}>
          <input
            className='border px-2 h-10 flex-grow outline-none'
            type='text'
            placeholder='리뷰를 작성해 주세요.'
            readOnly
          />
          <button className='bg-[#769FCD] h-10 text-white p-2 rounded-tr-md rounded-br-md'>
            등록
          </button>
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className='mb-4 flex flex-col gap-3'>
          <div className='flex items-center gap-4 justify-center'>
            <ReviewRating onRatingChange={handleRatingChange} />
            <span className='text-2xl font-semibold'>{rating}</span>
          </div>
          <input
            className='border px-2 h-10 flex-grow outline-none placeholder:text-sm rounded-md'
            type='text'
            value={title}
            name='title'
            placeholder='리뷰 제목을 입력해 주세요.'
            onChange={handleChange}
            required
          />
          <div>
            <textarea
              className='w-full border rounded-md p-2 placeholder:text-sm outline-none h-28 resize-none'
              maxLength={200}
              value={content}
              name='content'
              placeholder='리뷰는 최대 200자까지 등록 가능합니다.'
              onChange={handleChangeContent}
              required
            />
            <p className='text-xs text-gray-400'>({content.length}/200)</p>
          </div>
          <div className='flex gap-2'>
            <button
              type='submit'
              className='bg-[#769FCD] h-10 text-white p-2 rounded-md flex-1 hover:opacity-70 transition ease-linear duration-300'
            >
              리뷰 등록
            </button>
            <button
              type='button'
              onClick={handleCloseForm}
              className='hover:bg-[#D6E6F2] transition ease-linear duration-300 border h-10 p-2 rounded-md flex-1 hover:opacity-70'
            >
              취소
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
