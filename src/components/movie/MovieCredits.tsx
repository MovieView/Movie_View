"use client"

import { Cast, Credits } from "@/models/movie.model";
import MovieCast from "./MovieCast";
import { useEffect, useRef, useState } from "react";

const MovieCredits = ({
  cast
}: Credits) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isLeftButtonVisible, setIsLeftButtonVisible] = useState(false);
  const [isRightButtonVisible, setIsRightButtonVisible] = useState(true);
  
  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const scrollHandler = () => {
        setIsLeftButtonVisible(slider.scrollLeft > 0);
        setIsRightButtonVisible(slider.scrollLeft < slider.scrollWidth - slider.clientWidth);
      };
      slider.addEventListener("scroll", scrollHandler);
      return () => {
        slider.removeEventListener("scroll", scrollHandler);
      };
    }
  }, []);


  return (
    <div className="mx-auto mt-6 max-w-5xl sm:px-6 lg:max-w-5xl lg:grid lg:gap-x-8 lg:px-8  space-y-3">
      <div className="font-bold text-lg">출연진</div>
      <div className="relative overflow-x-hidden">
        <button
            className={`absolute left-2 ${isLeftButtonVisible ? 'block' : 'hidden'} top-1/3 transform -translate-y-1/2 bg-white rounded-full shadow-md p-2 z-10 w-[40px] h-[40px] hover:bg-gray-200 transition-colors duration-300`}
            onClick={scrollLeft}
          >
            &lt;
          </button>
        <div ref={sliderRef} className="scrollbar-hide flex overflow-x-auto space-x-3">
          {cast.map((cast: Cast) => (
            <div key={cast.id} className="flex-shrink-0 w-20">
              <MovieCast name={cast.name} profile_path={cast.profile_path} />
            </div>
          ))}
        </div>
        <button
            className={`absolute right-2 ${isRightButtonVisible ? 'block' : 'hidden'} top-1/3 transform -translate-y-1/2 bg-white rounded-full shadow-md p-2 z-10 w-[40px] h-[40px] hover:bg-gray-200 transition-colors duration-300`}
            onClick={scrollRight}
          >
            &gt;
        </button>
      </div>
    </div> 
  );
};

export default MovieCredits;