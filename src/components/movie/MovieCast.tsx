interface Props {
  name: string;
  profile_path: string;
}

const MovieCast = ({
  name,
  profile_path
}: Props) => {
  return (
    <div className="flex flex-col items-center">
      {profile_path 
      ? <img 
          className="w-full h-auto rounded-lg shadow-lg" 
          src={`https://image.tmdb.org/t/p/original/${profile_path}`} 
          alt={name}
        />
      : <div className="w-full h-[7.5rem] bg-slate-500 rounded-lg shadow-lg"></div>
      }
      <div className="mt-2 text-center text-xs">{name}</div>
    </div>
  );
};

export default MovieCast;