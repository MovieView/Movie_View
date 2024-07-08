import React, { ChangeEvent, FormEvent } from 'react';
import { CommentContent } from '@/models/comment.model';

interface Props {
  comment: CommentContent;
  text: string;
  handleCloseForm: () => void;
  setComment: React.Dispatch<React.SetStateAction<CommentContent>>;
  onSubmit: (e: FormEvent) => void;
}

export default function CommentForm({
  comment,
  text,
  handleCloseForm,
  setComment,
  onSubmit,
}: Props) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setComment({ ...comment, [name]: value });
  };

  return (
    <>
      <form onSubmit={onSubmit} className='mb-4 flex flex-col gap-3'>
        <div>
          <textarea
            className='w-full border rounded-md p-2 placeholder:text-sm outline-none h-20 resize-none'
            maxLength={100}
            value={comment.content}
            name='content'
            placeholder='답글은 최대 100자까지 등록 가능합니다.'
            onChange={handleChange}
            required
          />
          <p className='text-xs text-gray-400'>
            ({comment.content.length}/100)
          </p>
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
