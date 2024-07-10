import { authOPtions } from '@/lib/authOptions';
import { dbConnectionPoolAsync } from '@/lib/db';
import { formatUserId } from '@/utils/formatUserId';
import { ResultSetHeader } from 'mysql2';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';

export interface IReviewData {
  movieId: number;
  title: string;
  rating: number;
  content: string;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOPtions);
    if (!session?.provider && !session?.uid) {
      return;
    }

    const userId = formatUserId(session.provider, session.uid);

    if (!userId) {
      return new Response('Authentication Error', { status: 401 });
    }

    const data: IReviewData = await req.json();

    const movie = await addMovieId(data.movieId);

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

async function addReview(userId: string, data: IReviewData) {
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
    const connection = await dbConnectionPoolAsync.getConnection();
    const [result] = await connection.execute(sql, values);
    connection.release();
    return (result as ResultSetHeader).affectedRows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function addMovieId(movieId: number) {
  const sql = `INSERT IGNORE INTO movies (id) VALUES (?)`;
  const values = [movieId];
  try {
    const connection = await dbConnectionPoolAsync.getConnection();
    const [result] = await await connection.execute(sql, values);
    connection.release();
    return (result as ResultSetHeader).affectedRows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
