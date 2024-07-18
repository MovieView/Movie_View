import { authOptions } from '@/lib/authOptions';
import { getDBConnection } from '@/lib/db';
import { addMovieId } from '@/services/movieServices';
import { addReview, getMovieReviewsCount, getReviews } from '@/services/reviewServices';
import { formatUserId } from '@/utils/authUtils';
import { PoolConnection } from 'mysql2/promise';
import { getServerSession } from 'next-auth';


interface ReviewData {
  movieId: number;
  title: string;
  rating: number;
  content: string;
  movieTitle: string;
  posterPath: string;
}

const MAX_RESULT = 8;
const PAGE = 1;
const SORT = 'latest';

export async function GET(
  req: Request,
  { params }: { params: { movieId: number } }
) {
  const { searchParams } = new URL(req.url);
  let maxResults = searchParams.get('maxResults') ?? MAX_RESULT;
  let page = searchParams.get('page') ?? PAGE;
  let sort = searchParams.get('sort') ?? SORT;
  const session = await getServerSession(authOptions);

  const { provider, uid } = session ?? {};
  if (!provider || !uid) {
    return new Response('Authentication Error', { status: 401 });
  }

  const userId = formatUserId(provider, uid);
  if (!userId) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    });
  }

  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection();
    const reviews = await getReviews(
      params.movieId,
      Number(maxResults),
      Number(page),
      sort,
      userId,
      connection
    );

    const count = await getMovieReviewsCount(
      params.movieId, 
      connection
    );
    const result = {
      reviews,
      pagination: {
        currentPage: +page,
        totalCount: count ? count.totalCount : 0,
      },
    };
    return Response.json(result);
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
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
  