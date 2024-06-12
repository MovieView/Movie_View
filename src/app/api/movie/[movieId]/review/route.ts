import { dbConnection } from '@/lib/db';
import { FieldPacket, RowDataPacket } from 'mysql2';

// 영화별 리뷰 조회
const MAX_RESULT = 8;
const PAGE = 1;
const SORT = 'latest';

export async function GET(
  req: Request,
  { params }: { params: { movieId: number } }
) {
  try {
    const { searchParams } = new URL(req.url);
    let maxResults = searchParams.get('maxResults') ?? MAX_RESULT;
    let page = searchParams.get('page') ?? PAGE;
    let sort = searchParams.get('sort') ?? SORT;

    const reviews = await getReviews(
      params.movieId,
      Number(maxResults),
      Number(page),
      sort
    );

    const count = await reviewsCount(params.movieId);
    const result = {
      reviews,
      pagination: {
        currentPage: +page,
        totalCount: count ? count.totalCount : 0,
      },
    };
    return Response.json(result);
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

//  LEFT JOIN users_profile_pictures AS upp ON u.id=upp.users_id
//  upp.filepath,
// 처음 리뷰 리스트 받아올 때 liked도 같이 추가했습니다. 그러면서 userId도 가져오게 만들었어요! :)
async function getReviews(
  movieId: number,
  maxResults: number,
  page: number,
  sort: string,
  userId: number | null = 2
) {
  const offset = maxResults * (page - 1);
  const values: Array<string | number> = [movieId, offset, maxResults];
  let liked = ``;

  if (userId) {
    liked = `, (SELECT COUNT(*) FROM movie_view.reviews_likes AS rl WHERE HEX(rl.reviews_id) = HEX(r.id) AND rl.users_id = ?) > 0 AS liked`;
    values.unshift(userId);
  }

  const orderBy =
    sort === 'like' ? 'likes DESC, createdAt DESC' : 'createdAt DESC';
  const sql = `SELECT HEX(r.id) AS id, r.movies_id AS movieId, r.users_id AS userId, r.rating, r.title,
                r.content, r.created_at AS createdAt, r.updated_at AS updatedAt, u.nickname,
                (SELECT COUNT(*) FROM reviews_likes AS rl WHERE HEX(rl.reviews_id) = HEX(r.id)) AS likes
                ${liked}
                FROM reviews AS r
                JOIN users AS u ON u.id = r.users_id
                WHERE r.movies_id=?
                ORDER BY ${orderBy}
                LIMIT ?, ?`;
  try {
    const [result] = await dbConnection.promise().query(sql, values);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function reviewsCount(movieId: number) {
  const sql = `SELECT COUNT(*) AS totalCount FROM reviews WHERE movies_id=?`;
  const values = [movieId];
  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await dbConnection
      .promise()
      .query(sql, values);

    return result[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}
