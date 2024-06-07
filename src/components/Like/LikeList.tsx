/* eslint-disable @next/next/no-async-client-component */
"use client"

import { ILike, ReviewLike } from '@/app/api/like/route';
import { useEffect, useState } from 'react';
import LikeButton from './LikeButton';

export default function LikeList() {
  const [likes, setLikes] = useState<ILike[]>([]);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [liked, setLiked] = useState(false);
  const isloggedIn = true;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/like')

        if (!response.ok) {
          throw new Error('Failed to fetch likes');
        }

        const data = await response.json()
        setLikes(data);
      console.log(789);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    // 클라이언트 측에서만 실행되도록 설정
    if (typeof window !== 'undefined') {
      console.log(123);
      fetchData();
    }
  }, [])

  const handleLikedItem = (like: ILike) => {
    if(likes.includes(like)) {
      // uncheck
      setLikes(likes.filter((item) => item.id !== like.id));
    } else {
      // check
      setLikes([...likes, like]);
    }
  }

  return (
      <div>
        <h1>Likes</h1>
        <ul style={{fontSize: "24px"}}>
          {
            likes.map((like: ILike, index: number) => (
              <li key={index}>
                리뷰 아이디 : {like.reviews_id}
                <LikeButton like={like} onLiked={handleLikedItem} />
              </li>
            ))
          }
        </ul>
      </div>
  )
}

