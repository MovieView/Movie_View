import { IReview } from '@/hooks/useReview';
import Image from 'next/image';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { AiOutlineLike } from 'react-icons/ai';
import { FaStar } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';
import ReviewButton from './ReviewButton';
import { IReviewData } from '@/app/api/review/route';

interface IProps {
  review: IReview;
  onUpdate: (
    reviewId: string,
    title: string,
    rating: number,
    content: string
  ) => void;
  onDelete: (reviewId: string) => void;
}

export default function ReviewItem({ review, onUpdate, onDelete }: IProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [reviewData, setReviewData] = useState<IReviewData>(review);
  const userId = 2;

  const handleUpdate = (reviewId: string) => {
    console.log(isEdit);
    console.log(reviewId);
    console.log(reviewData);
    setIsEdit(true);
    onUpdate(
      reviewId,
      reviewData.title,
      Number(reviewData.rating),
      reviewData.content
    );
    setIsEdit(false);
    console.log(isEdit);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReviewData({ ...reviewData, [name]: value });
  };

  useEffect(() => {
    setReviewData({ ...review });
  }, [review]);

  // useEffect(() => {
  //   if (contentRef.current) {
  //     const lineHeight = parseInt(
  //       window.getComputedStyle(contentRef.current).lineHeight
  //     );
  //     const maxHeight = 2 * lineHeight;
  //     const actualHeight = contentRef.current.scrollHeight;
  //     if (actualHeight > maxHeight) {
  //       setExpanded(true);
  //     } else {
  //       setExpanded(false);
  //     }
  //   }
  // }, [review.content]);

  return (
    <div className='flex p-4 border max-w-3xl rounded-xl mx-auto shadow-sm'>
      <div className='overflow-hidden shrink-0 mr-2 w-10 h-10 rounded-full'>
        {review.filepath ? (
          <Image
            className='w-full h-full object-cover'
            src={review.filepath}
            alt={review.nickname}
            width={500}
            height={500}
          />
        ) : (
          <div className='bg-[#B9D7EA] w-full h-full '></div>
        )}
      </div>
      <div
        className='flex flex-col gap-1'
        style={{ width: 'calc(100% - 3rem)' }}
      >
        <div className='flex w-full'>
          <div className='text-sm flex items-center gap-1'>
            <FaStar className='text-amber-400' />
            {isEdit ? (
              <input
                type='number'
                name='rating'
                value={reviewData.rating ?? ''}
                min={0}
                max={10}
                onChange={onChange}
                required
              />
            ) : (
              <span>{review.rating}점</span>
            )}
          </div>
          {userId == review.userId && (
            <div className='flex gap-2 ml-auto'>
              <ReviewButton
                text='수정'
                fontSize='sm'
                onClick={() => setIsEdit(true)}
              />
              <ReviewButton
                text='삭제'
                fontSize='sm'
                onClick={() => onDelete(review.id)}
              />
            </div>
          )}
        </div>
        {isEdit ? (
          <input
            className='border px-2 h-10 flex-grow outline-none placeholder:text-sm rounded-md'
            type='text'
            value={reviewData.title ?? ''}
            name='title'
            placeholder='리뷰 제목을 입력해 주세요.'
            onChange={onChange}
            required
          />
        ) : (
          <p className='font-semibold text-sm break-words'>{review.title}</p>
        )}

        {isEdit ? (
          <textarea
            className='w-full border rounded-md p-2 placeholder:text-sm outline-none h-28 resize-none'
            maxLength={200}
            name='content'
            placeholder='리뷰는 최대 200자까지 등록 가능합니다.'
            value={reviewData.content ?? ''}
            onChange={onChange}
          />
        ) : (
          <div ref={contentRef}>
            <pre
              className={`break-words whitespace-pre-wrap ${
                expanded ? 'line-clamp-none ' : 'line-clamp-2'
              } `}
            >
              {review.content}
            </pre>
          </div>
        )}

        {isEdit && (
          <div className='flex gap-2'>
            <button
              onClick={() => handleUpdate(review.id)}
              className='bg-[#769FCD] h-10 text-white p-2 rounded-md flex-1 hover:opacity-70 transition ease-linear duration-300'
            >
              리뷰 수정
            </button>
            <button
              onClick={() => setIsEdit(false)}
              className='hover:bg-[#D6E6F2] transition ease-linear duration-300 border h-10 p-2 rounded-md flex-1 hover:opacity-70'
            >
              취소
            </button>
          </div>
        )}

        {
          <div
            className={`ml-auto transform transition ease-linear duration-300 ${
              expanded ? 'rotate-180' : 'rotate-0'
            }`}
          >
            <button className='' onClick={() => setExpanded(!expanded)}>
              <IoIosArrowDown />
            </button>
          </div>
        }

        <div className='flex gap-2 mt-2 '>
          <span className='mr-2 text-sm'>{review.nickname}</span>
          <span className='text-gray-400 text-sm'>
            {format(review.createdAt)}
          </span>
          {review.createdAt !== review.updatedAt && (
            <span className='text-gray-400 text-sm'>(수정됨)</span>
          )}
        </div>

        <ReviewButton
          text={review.likes.toString()}
          icon={<AiOutlineLike />}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

function format(dateStr: string): string {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  });
  const formattedDate = date && formatter.format(date);
  return formattedDate;
}
