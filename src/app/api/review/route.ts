import { authOptions } from '@/lib/authOptions';
import { dbConnectionPoolAsync } from '@/lib/db';
import { ReviewData } from '@/models/review.model';
import { formatUserId } from '@/utils/formatUserId';
import { ResultSetHeader } from 'mysql2';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
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

    const data: ReviewData = await req.json();

    await addMovieId(data.movieId);

    const review = await addReview(userId, data);

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
    console.error(err);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

async function addReview(userId: string, data: ReviewData) {
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

  const connection = await dbConnectionPoolAsync.getConnection();
  try {
    const [result] = await connection.execute(sql, values);
    connection.release();
    return (result as ResultSetHeader).affectedRows;
  } catch (err) {
    connection.release();
    console.error(err);
    throw err;
  }
}

async function addMovieId(movieId: number) {
  const sql = `INSERT IGNORE INTO movies (id) VALUES (?)`;
  const values = [movieId];

  const connection = await dbConnectionPoolAsync.getConnection();
  try {
    const [result] = await connection.execute(sql, values);
    connection.release();
    return (result as ResultSetHeader).affectedRows;
  } catch (err) {
    connection.release();
    console.error(err);
    throw err;
  }
}
