import { useState } from 'react';
import { FaStar, FaStarHalf } from 'react-icons/fa';

interface Props {
  rating: number;
  onRatingChange: (newRating: number) => void;
}

export default function ReviewRating({ rating, onRatingChange }: Props) {
  const [score, setScore] = useState(rating / 2);
  const [position, setPosition] = useState(rating / 2);

  const handleLeftHalfEnter = (index: number) => setScore(index + 0.5);
  const handleRightHalfEnter = (index: number) => setScore(index + 1);

  const handleStarClick = () => {
    setPosition(score);
    onRatingChange(score * 2);
  };

  const handleStarLeave = () => {
    if (score !== position) {
      setScore(position);
    }
  };

  return (
    <div className='flex h-10'>
      {[...Array(5)].map((_, index) => {
        const halfStar =
          score - Math.floor(score) === 0.5 && Math.floor(score) === index;
        const filledStar = index + 1 <= score;
        return (
          <div
            key={index}
            className='w-8 h-8 flex justify-between relative cursor-pointer'
            onClick={handleStarClick}
          >
            {halfStar && (
              <FaStarHalf className='absolute z-[5] h-8 w-8 fill-amber-400 hover:fill-amber-400' />
            )}

            <FaStar
              className={`absolute hover:fill-amber-400 h-8 w-8 ${
                filledStar ? 'fill-amber-400' : 'fill-gray-300'
              }`}
            />
            <div
              className='w-4 h-full z-10'
              key={index + 'left'}
              onMouseEnter={() => handleLeftHalfEnter(index)}
              onMouseLeave={handleStarLeave}
            />
            <div
              className='w-4 h-full z-10'
              key={index + 'right'}
              onMouseEnter={() => handleRightHalfEnter(index)}
              onMouseLeave={handleStarLeave}
            />
          </div>
        );
      })}
    </div>
  );
}
