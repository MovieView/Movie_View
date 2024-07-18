import { authOptions } from '@/lib/authOptions';
import { getDBConnection } from '@/lib/db';
import { createReviewLikeNotification } from '@/services/notificationServices';
import { getReviewWriterSocialAccountsUID } from '@/services/reviewCommentServices';
import { deleteLike, getLike, postLike } from '@/services/reviewLikeServices';
import { formatUserId } from '@/utils/authUtils';
import { PoolConnection } from 'mysql2/promise';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';


export const GET = async (
  req: Request,
  { params }: { params: { reviewId: string } }
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
    const result = await getLike(
      params.reviewId, 
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
  { params }: { params: { reviewId: string, movieId: string } }
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
    await connection.beginTransaction();

    const like = {
      id: uuidv4().replace(/-/g, ''),
      reviews_id: params.reviewId,
      social_accounts_uid: social_accounts_uid,
    };
    const result = await postLike(like, connection);

    const reviewWriterSocialAccountsUID = await getReviewWriterSocialAccountsUID(
      params.reviewId,
      connection
    );

    if (reviewWriterSocialAccountsUID) {
      await createReviewLikeNotification(
        reviewWriterSocialAccountsUID,
        session.user.name as string,
        session.user.image as string,
        params.movieId,
        connection
      );
    }

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
  { params }: { params: { reviewId: string } }
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
    await connection.beginTransaction();

    const result = await deleteLike(
      params.reviewId,
      social_accounts_uid as string,
      connection
    );

    await connection.commit();
    connection.release();

    return new Response(JSON.stringify(result), {
      status: 200,
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