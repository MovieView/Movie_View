import 'dotenv/config';
import { createClient } from 'redis';
import { setRedisData, getRedisData, RedisClient } from '@/lib/redis';
import { NextRequest } from 'next/server';
import { getIP } from '@/utils/networkUtils';


interface MovieData {
  id: number,
  title: string,
  posterUrl: string
}

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const title : string | null = searchParams.get('title');
  const page : string | null = searchParams.get('page');
  const accessTokenTMDB : string | undefined = process.env.TMDB_ACCESS_TOKEN;

  const userIP : string = getIP(request);
  console.log(userIP);

  const client : RedisClient = createClient({
    url: process.env.REDIS_URL
  });
  await client.connect();
  
  const redisSearchUserKey : string = `search_movie:${userIP}`;
  const redisData : string | null = await getRedisData(client, redisSearchUserKey);
  if (redisData) {
    await client.quit();
    return new Response(JSON.stringify({
      error: 'You are being rate limited. Please try again later.'
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

  if (!accessTokenTMDB) {
    await client.quit();
    throw new Error('API key is missing');
  }
 
  const fetchParams : RequestInit = {
    method: 'GET',
    body: null,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessTokenTMDB}`,
    },
  };

  let url : string;
  if (title) {
    const encodedTitle : string = encodeURIComponent(title);
    url = `https://api.themoviedb.org/3/search/movie?query=${encodedTitle}&language=ko-KR&include_adult=false`;
  } else {
    url = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=ko-KR&sort_by=popularity.desc';
  }
  
  if (page && parseInt(page) > 0) {
    url += `&page=${page}`;
  }

  const cacheAPIResultKey : string = `tmdb:${url}`;
  const cacheAPIData : string | null = await getRedisData(client, cacheAPIResultKey);
  if (cacheAPIData) {
    await client.quit();
    return new Response(cacheAPIData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const resp : Response = await fetch(url, fetchParams);
  if (!resp.ok) {
    await client.quit();
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