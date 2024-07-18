import { authOptions } from '@/lib/authOptions';
import { getDBConnection } from '@/lib/db';
import { deleteMovieLike, getMovieLike, postMovieLike } from '@/services/movieServices';
import { formatUserId } from '@/utils/authUtils';
import { PoolConnection } from 'mysql2/promise';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';


export const GET = async (
  req: Request,
  { params }: { params: { movieId: string } }
) => {
  const session = await getServerSession(authOptions);
  if (!session?.provider && !session?.uid) {
    return;
  }

  const social_accounts_uid = formatUserId(session.provider, session.uid);
  if (!social_accounts_uid) {
    return new Response('Authentication Error', { status: 401 });
  }

  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection() as PoolConnection;
    const result = await getMovieLike(
      params.movieId, 
      social_accounts_uid,
      connection
    );

    connection.release();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    connection?.release();

    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
};

export const POST = async (
  req: Request,
  { params }: { params: { movieId: string } }
) => {
  const session = await getServerSession(authOptions);
  if (!session?.provider && !session?.uid) {
    return;
  }

  const social_accounts_uid = formatUserId(session.provider, session.uid);
  if (!social_accounts_uid) {
    return new Response('Authentication Error', { status: 401 });
  }

  const movieData = await req.json()
  const like = {
    id: uuidv4().replace(/-/g, ''),
    movies_id: params.movieId,
    movie_title: movieData.movieTitle,
    poster_path: movieData.posterPath,
    social_accounts_uid: social_accounts_uid,
  };

  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection() as PoolConnection;
    await connection.beginTransaction();

    const result = await postMovieLike(like, connection);

    await connection.commit();
    connection.release();
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    await connection?.rollback();
    connection?.release();
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { movieId: string } }
) => {
  const session = await getServerSession(authOptions);
  if (!session?.provider && !session?.uid) {
    return;
  }
  const social_accounts_uid = formatUserId(session.provider, session.uid);
  if (!social_accounts_uid) {
    return new Response('Authentication Error', { status: 401 });
  }

  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection() as PoolConnection
    const result = await deleteMovieLike(
      params.movieId, 
      social_accounts_uid as string,
      connection
    );

    connection.release();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    connection?.release();
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
};