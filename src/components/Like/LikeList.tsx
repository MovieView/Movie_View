/* eslint-disable @next/next/no-async-client-component */
"use client"

import { ILike } from '@/app/api/like/route';
import LikeButton from './LikeButton';
import { useLike } from '@/hook/useLike';

export default function LikeList() {
  const { likes, likeToggle } = useLike();

  return (
      <div>
        <h1>Likes</h1>
        <ul style={{fontSize: "24px"}}>
          {
            likes.map((like: ILike, index: number) => (
              <li key={index}>
                리뷰 아이디 : {like.reviews_id}
                <LikeButton like={like} onClick={likeToggle} />
              </li>
            ))
          }
        </ul>
      </div>
  )
}

