import 'dotenv/config';
import { createClient } from 'redis';
import { setRedisData, getRedisData, RedisClient } from '@/lib/redis';


interface MovieData {
  id: number,
  title: string,
  posterUrl: string
}

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const title : string | null = searchParams.get('title');
  const page : string | null = searchParams.get('page');
  const accessTokenTMDB : string | undefined = process.env.TMDB_ACCESS_TOKEN;

  // Redis 클라이언트 생성 / 연결
  const client : RedisClient = createClient({
    url: process.env.REDIS_URL
  });
  await client.connect();
  
  // Rate Limiting : 2초에 1번 요청 가능
  const redisSearchUserKey : string = "search_movie:127.0.0.1";
  const redisData : string | null = await getRedisData(client, redisSearchUserKey);
  if (redisData) {
    return new Response(JSON.stringify({
      error: "You are being rate limited. Please try again later."
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } else {
    await setRedisData(
      client, 
      redisSearchUserKey, 
      '1', 
      {EX: 2}
    );
  }

  // API key가 없을 경우 에러 발생
  if (!accessTokenTMDB) {
    throw new Error('API key is missing');
  }
 
  // Fetch 설정
  const fetchParams : RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessTokenTMDB}`,
    },
  };

  // URL 생성
  let url : string;
  if (title) {
    url = `https://api.themoviedb.org/3/search/movie?query=${title}&language=ko-KR&include_adult=false`;
  } else {
    url = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=ko-KR&sort_by=popularity.desc';
  }
  
  if (page && parseInt(page) > 0) {
    url += `&page=${page}`;
  }

  // TMDB API 캐싱 결과 가져오가
  const cacheAPIResultKey : string = `tmdb:${url}`;
  const cacheAPIData : string | null = await getRedisData(client, cacheAPIResultKey);
  // 캐싱된 데이터가 있을 경우 캐싱된 데이터 반환
  if (cacheAPIData) {
    console.log('Cache hit'); // Debugging
    return new Response(cacheAPIData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // TMDB API 호출
  const resp : Response = await fetch(url, fetchParams);
  if (!resp.ok) {
    throw new Error('Failed to fetch data');
  }

  const respJSON : any = await resp.json();
  const data : Array<MovieData> = respJSON.results.map((movie : any) => {
    return {
      id: movie.id,
      title: movie.title,
      posterUrl: typeof movie.poster_path === 'string' ? 
        `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
    };
  });

  respJSON['results'] = data;

  // TMDB API 캐싱 결과 저장, 2분간 유효
  await setRedisData(
    client, 
    cacheAPIResultKey, 
    JSON.stringify(respJSON), 
    {EX: 120}
  );
  await client.quit();

  return new Response(JSON.stringify(respJSON), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};