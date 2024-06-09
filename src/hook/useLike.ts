import { ILike } from "@/app/api/like/route";
import { useEffect, useState } from "react"

export const useLike = () => {
  const [likes, setLikes] = useState<ILike[]>([]);

  const addLike = async (reviewId: number) => {  
    const response = await fetch(`/api/like/${reviewId}`,  {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.json();
  };
  
  const deleteLike = async (reviewId: number) => {
    const response = await fetch(`/api/like/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.json();
  };

  const likeToggle = (like: ILike) => {
    // 권한 확인
    // if(!isloggedIn) {
    //   alert("로그인이 필요합니다.");
    //   return;
    // }
    console.log("asdfas",typeof like.liked);
  
    if(like.liked) {
      // 언라이크 상태 -> 라이크를 실행
      deleteLike(like.reviews_id).then(() => {
        setLikes((prev) => 
          prev.map((item) => 
            item.reviews_id === like.reviews_id
            ? {...item, liked: 0, liked_count: item.liked_count - 1}
            : item
          )
        )
      });
    } else {
      // 라이크 상태 -> 언라이크를 실행
      addLike(like.reviews_id).then(() => {
          setLikes((prev) => 
          prev.map((item) => 
          item.reviews_id === like.reviews_id
          ? {...item, liked: 1, liked_count: item.liked_count + 1}
          : item
          )
        )
      })
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/like')

        if (!response.ok) {
          throw new Error('Failed to fetch likes');
        }

        const data = await response.json()
        setLikes(data);
      console.log(data);

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

  return { likes, likeToggle };
}