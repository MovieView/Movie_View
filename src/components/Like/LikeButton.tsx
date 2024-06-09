import { ILike } from "@/app/api/like/route";
import { useState } from "react";

interface Props {
  like: ILike;
  onLiked: (like: ILike) => void;
}

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
  console.log(like.liked);

  if(like.liked) {
    // 라이크 상태 -> 언라이크를 실행
    addLike(like.reviews_id).then(() => {
      // setLikes([
      //   ...likes,
      //   like
      // ])
    })
  } else {
    // 언라이크 상태 -> 라이크를 실행
    deleteLike(like.reviews_id).then(() => {
      // setLikes([
      //   ...likes,
      //   like
      // ]);
    });
  }
};


const LikeButton = ({ like, onLiked }: Props) => {
  const handleLiked = () => {
    likeToggle(like);
    // onLiked(like);
  }

  return (
    <button 
      style={like.liked ? {color: "red"} : {color: "black"}}
      onClick={handleLiked}  
    >
      ♥ {like.liked_count}
    </button>
  );
};

export default LikeButton;