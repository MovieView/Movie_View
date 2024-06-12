import { dbConnection as db } from '@/lib/db';
import { ResultSetHeader } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export interface IReviewData {
  movieId: number;
  title: string;
  rating: number;
  content: string;
}

const USER_ID = 2;
// 리뷰 작성
export async function POST(req: Request) {
  try {
    // TODO: userId 받아오기 구현 필요
    const userId = USER_ID;

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
    // TODO: 에러처리
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

async function addReview(userId: number, data: IReviewData) {
  const id = uuidv4().replace(/-/g, '');
  const sql = `INSERT INTO reviews (id, movies_id, users_id, rating, title, content) VALUES(UNHEX(?), ?, ?, ?, ?, ?)`;
  const values = [
    id,
    data.movieId,
    userId,
    data.rating,
    data.title,
    data.content,
  ];

  try {
    const [result] = await db.promise().query(sql, values);

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
    const [result] = await db.promise().query(sql, values);
    return (result as ResultSetHeader).affectedRows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
