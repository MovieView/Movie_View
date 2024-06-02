import { db } from '@/app/db/db';

// 영화별 리뷰 조회
const MAX_RESULT = 8;
const PAGE = 1;

export async function GET(
  req: Request,
  { params }: { params: { movieId: number } }
) {
  try {
    const { searchParams } = new URL(req.url);
    let maxResults = searchParams.get('maxResults') ?? MAX_RESULT;
    let page = searchParams.get('page') ?? PAGE;

    const reviews = await getReviews(
      params.movieId,
      Number(maxResults),
      Number(page)
    );
    return Response.json(reviews);
  } catch (err) {
    console.error(err);
    // TODO: 에러처리
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

// TODO: user 정보 join
async function getReviews(movieId: number, maxResults: number, page: number) {
  const offset = maxResults * (page - 1);
  const sql = `SELECT HEX(r.id) AS id, r.movies_id AS movieId, r.users_id AS userId, r.rating, r.title,
                r.content, r.created_at AS createdAt, r.updated_at AS updatedAt, u.nickname, upp.filepath,
                (SELECT COUNT(*) FROM reviews_likes AS rl WHERE HEX(rl.reviews_id) = HEX(r.id)) AS likes
                FROM reviews AS r
                JOIN users AS u ON u.id = r.users_id
                LEFT JOIN users_profile_pictures AS upp ON u.id = upp.users_id
                WHERE r.movies_id = ?
                LIMIT ?, ?`;
  const values: Array<string | number> = [movieId, offset, maxResults];
  try {
    const [result] = await db.promise().query(sql, values);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
