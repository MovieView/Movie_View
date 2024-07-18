import { getDBConnection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { formatUserId } from '@/utils/authUtils';
import { ICommentContent } from '@/models/comment.model';
import { PoolConnection } from 'mysql2/promise';
import { 
  getSocialAccountsExtraData, 
  getUserIDBySocialAccountsUID, 
  getUserSocialAccountsUIDByReviewId 
} from '@/services/userServices';
import { createReviewCommentNotification } from '@/services/notificationServices';
import { getMovieIdUsingReviewId } from '@/services/movieServices';
import { addComment, getComments, getReviewCommentsCount } from '@/services/reviewCommentServices';


const MAX_RESULT = 8;
const PAGE = 1;

export async function GET(
  req: Request,
  { params }: { params: { reviewId: string } }
) {
  let connection: PoolConnection | undefined;
  try {
    const { searchParams } = new URL(req.url);
    const maxResults = searchParams.get('maxResults') ?? MAX_RESULT;
    const page = searchParams.get('page') ?? PAGE;

    connection = await getDBConnection();
    const comments = await getComments(
      params.reviewId,
      Number(maxResults),
      Number(page),
      connection
    );

    const count = await getReviewCommentsCount(params.reviewId, connection);
    const result = {
      comments,
      pagination: {
        currentPage: +page,
        totalCount: count ? count.totalCount : 0,
      },
    };

    connection.release();
    return new Response(JSON.stringify(result), {
      status: 200,
    });
  } catch (err) {
    connection?.release();
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { reviewId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Authentication Error', { status: 401 });
  }

  const { provider, uid } = session ?? {};
  if (!provider || !uid) {
    return new Response('Authentication Error', { status: 401 });
  }

  const formattedUid = formatUserId(provider, uid);
  if (!formattedUid) {
    return new Response(JSON.stringify({ message: 'Authentication Error' }), {
      status: 401,
    });
  }

  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection();
    await connection.beginTransaction();

    const user = await getUserIDBySocialAccountsUID(formattedUid, connection);
    if (!user) {
      return new Response(JSON.stringify({ message: 'User does not exist.' }), {
        status: 404,
      });
    }

    const movieId = await getMovieIdUsingReviewId(params.reviewId, connection);
    if (!movieId) {
      connection.release();

      return new Response(JSON.stringify({ message: 'Review does not exist.' }), {
        status: 404,
      });
    }

    const data: ICommentContent = await req.json();
    const added = await addComment(
      params.reviewId, 
      user.userId, 
      data.content,
      connection
    );
    if (!added) {
      await connection.rollback();
      connection.release();

      return new Response(JSON.stringify({ message: 'Failed to add a comment.' }), {
        status: 500,
      });
    }

    await connection.commit();

    const reviewWriterUID = await getUserSocialAccountsUIDByReviewId(params.reviewId, connection);
    const {username, filepath} = await getSocialAccountsExtraData(formattedUid, connection);
    
    if (reviewWriterUID && username) {
      const notifCreated = await createReviewCommentNotification(
        connection, 
        filepath,
        username,
        reviewWriterUID,
        movieId
      );
      if (!notifCreated) {
        await connection.rollback();
      }
    }

    await connection.commit();
    connection.release();

    return new Response(
      JSON.stringify({ message: 'Comment has been created.' }),
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