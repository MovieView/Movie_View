import { authOptions } from '@/lib/authOptions';
import { getDBConnection } from '@/lib/db';
import { formatUserId } from '@/utils/authUtils';
import { ResultSetHeader } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';


interface ReviewData {
  movieId: number;
  title: string;
  rating: number;
  content: string;
  movieTitle: string;
  posterPath: string;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  const { provider, uid } = session ?? {};
  if (!provider || !uid) {
    return new Response('Authentication Error', { status: 401 });
  }

  const userId = formatUserId(provider, uid);
  if (!userId) {
    return new Response(JSON.stringify({ message: 'Authentication Error' }), {
      status: 401,
    });
  }

  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection();
    await connection.beginTransaction();

    const data: ReviewData = await req.json();
    await addMovieId(
      data.movieId, 
      data.movieTitle, 
      data.posterPath, 
      connection
    );
    const review = await addReview(
      userId, 
      data, 
      connection
    );

    await connection.commit();
    connection.release();

    if (!review) {
      return new Response(JSON.stringify({ message: 'Bad Request' }), {
        status: 400,
      });
    }

    return new Response(
      JSON.stringify({ message: 'Review has been created.' }),
      {
        status: 201,
      }
    );
  } catch (err) {
    await connection?.rollback();
    connection?.release();

    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

async function addReview(userId: string, data: ReviewData, connection: PoolConnection) {
  const id = uuidv4().replace(/-/g, '');
  const sql = `INSERT INTO reviews (id, movies_id, social_accounts_uid, rating, title, content) VALUES(UNHEX(?), ?, ?, ?, ?, ?)`;
  const values = [
    id,
    data.movieId,
    userId,
    data.rating,
    data.title,
    data.content,
  ];

  try {
    const [result] = await connection.execute(sql, values);
    return (result as ResultSetHeader).affectedRows;
  } catch (err) {
    throw err;
  }
}

async function addMovieId(
  movieId: number,
  movieTitle: string,
  posterPath: string,
  connection: PoolConnection
) {
  const sql = `INSERT IGNORE INTO movies (id, title, poster_path) VALUES (?,?,?)`;
  const values = [movieId, movieTitle, posterPath];

  try {
    const [result] = await connection.execute(sql, values);
    return (result as ResultSetHeader).affectedRows;
  } catch (err) {
    throw err;
  }
}