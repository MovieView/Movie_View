import { IReview } from '@/hooks/useReview';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';
import ReviewDropDownMenu from './ReviewDropDownMenu';
import ReviewForm from './ReviewForm';
import { IReviewFormData } from './ReviewsList';
import LikeButton from '../Like/LikeButton';
import { useSession } from 'next-auth/react';
import { formatUserId } from '@/utils/formatUserId';
import Image from 'next/image';

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
  const { data: session } = useSession();
  const userId = session && formatUserId(session?.provider, session?.uid);
  const contentRef = useRef<HTMLPreElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [reviewData, setReviewData] = useState<IReviewFormData>(review);

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    setIsFormOpen(true);

    const newReview = {
      title: reviewData.title.trim(),
      content: reviewData.content.trim(),
      rating: reviewData.rating,
    };

    if (newReview.title.length === 0 || newReview.content.length === 0) {
      window.alert('리뷰 제목과 내용은 최소 한 글자 이상 입력해 주세요.');
      return;
    }

    onUpdate(
      review.id,
      newReview.title,
      Number(newReview.rating),
      newReview.content
    );

    setIsFormOpen(false);
  };

  const handleCloseForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const handleResize = () => {
    if (contentRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(contentRef.current).lineHeight
      );

      const height = contentRef.current.offsetHeight;
      const lines = height / lineHeight;

      lines > 1 ? setShowButton(true) : setShowButton(false);
    }
  };

  const debouncedHandleResize = debounce(handleResize, 100);

  useEffect(() => {
    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [debouncedHandleResize]);

  useEffect(() => {
    setReviewData({ ...review });
    handleResize();
  }, [review]);

  return (
    <>
      <div className='flex p-4 border max-w-3xl rounded-xl mx-auto shadow-sm relative'>
        <div className='overflow-hidden shrink-0 mr-2 w-10 h-10 rounded-full'>
          {review.filePath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className='w-full h-full object-cover'
              src={review.filePath}
              alt={review.nickname}
            />
          ) : (
            <div className='bg-second w-full h-full '></div>
          )}
        </div>

        <div
          className='flex flex-col gap-1'
          style={{ width: 'calc(100% - 3rem)' }}
        >
          {isFormOpen ? (
            <ReviewForm
              handleCloseForm={handleCloseForm}
              review={reviewData}
              setReview={setReviewData}
              onSubmit={handleUpdate}
              text='리뷰 수정'
            />
          ) : (
            <>
              <div className='flex w-full'>
                <div className='text-sm flex items-center gap-1'>
                  <>
                    <FaStar className='text-amber-400' />
                    <span>{review.rating}점</span>
                  </>
                </div>

                {userId && userId === review.userId && !isFormOpen && (
                  <ReviewDropDownMenu
                    handleEdit={handleCloseForm}
                    reviewId={review.id}
                    onDelete={onDelete}
                  />
                )}
              </div>

              <p className='font-semibold text-sm break-words'>
                {review.title}
              </p>
              <div>
                <pre
                  ref={contentRef}
                  className={`break-words whitespace-pre-wrap ${
                    expanded ? 'line-clamp-none ' : 'line-clamp-2'
                  } `}
                >
                  {review.content}
                </pre>
              </div>

              {showButton && (
                <div
                  className={`ml-auto transform transition ease-linear duration-300 ${
                    expanded ? 'rotate-180' : 'rotate-0'
                  }`}
                >
                  <button className='' onClick={() => setExpanded(!expanded)}>
                    <IoIosArrowDown />
                  </button>
                </div>
              )}
            </>
          )}
          <div className='flex gap-2 mt-2 '>
            <span className='mr-2 text-sm'>
              {review.nickname ? review.nickname : '알 수 없음'}
            </span>
            <span className='text-gray-400 text-sm'>
              {format(review.createdAt)}
            </span>
            {review.createdAt !== review.updatedAt && (
              <span className='text-gray-400 text-sm'>(수정됨)</span>
            )}
          </div>

          <LikeButton
            reviewId={review.id}
            liked={review.liked}
            likesCount={review.likes}
          />
        </div>
      </div>
    </>
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

export function debounce(callback: () => void, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;

  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(callback, delay);
  };
}
