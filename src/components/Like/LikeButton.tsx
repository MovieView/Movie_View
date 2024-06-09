import { ILike } from "@/app/api/like/route";

interface Props {
  like: ILike;
  onClick: (like: ILike) => void;
}

const LikeButton = ({ like, onClick }: Props) => {
  return (
    <button 
      style={like.liked ? {color: "red"} : {color: "black"}}
      onClick={() => onClick(like)}  
    >
      ♥ {like.liked_count}
    </button>
  );
};

export default LikeButton;