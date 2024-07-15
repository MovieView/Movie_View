import { authOptions } from '@/lib/authOptions';
import { getDBConnection } from '@/lib/db';
import { Like } from '@/models/likes.model';
import { formatUserId } from '@/utils/formatUserId';
import { RowDataPacket } from 'mysql2';
import { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';

interface LikeQueryResult extends Like, RowDataPacket {}

interface ILike {
  id: string;
  reviews_id: string;
  social_accounts_uid: string | undefined;
}

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
    const like = {
      id: uuidv4().replace(/-/g, ''),
      reviews_id: params.reviewId,
      social_accounts_uid: social_accounts_uid,
    };
    const result = await postLike(like, connection);

    let movieId = '';
    // 영화 id를 찾기 위해 Referer 헤더를 확인
    if (req.headers.get('Referer') != null) {
      movieId = getMovieIdFromReferer(req.headers.get('Referer') as string);
    }

    const reviewWriterSocialAccountsUID = await getReviewWriterSocialAccountsUID(
      params.reviewId,
      connection
    );

    // 리뷰에 작성자의 UID가 존재할 경우에만 알림 생성
    if (reviewWriterSocialAccountsUID) {
      await createReviewLikeNotification(
        reviewWriterSocialAccountsUID,
        session.user.name as string,
        session.user.image as string,
        movieId,
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

async function getLike(
  reviewId: string,
  social_accounts_uid: string,
  connection: PoolConnection
): Promise<Like> {
  const sql = `SELECT 
                COALESCE(SUM(CASE WHEN social_accounts_uid = ? THEN 1 ELSE 0 END), 0) AS liked,
                COUNT(*) AS likes
              FROM movie_view.reviews_likes
              WHERE HEX(reviews_id) = ?;`;

  try {
    const [result] = await connection
      .execute<LikeQueryResult[]>(sql, [social_accounts_uid, reviewId]);

    return result[0];
  } catch (err) {
    throw err;
  }
}

async function postLike(like: ILike, connection: PoolConnection) {
  const sql = `INSERT IGNORE INTO movie_view.reviews_likes (id, reviews_id, social_accounts_uid)
             VALUES ( UNHEX(?), UNHEX(?), ? );`;

  try {
    const [result] = await connection
      .execute(sql, [like.id, like.reviews_id, like.social_accounts_uid]);
    
    return result;
  } catch (err) {
    throw err;
  }
}

async function deleteLike(
  reviewId: string, 
  social_accounts_uid: string,
  connection: PoolConnection
) {
  const sql = `DELETE FROM movie_view.reviews_likes WHERE reviews_id=UNHEX(?) AND social_accounts_uid=?;`;

  try {
    connection = await getDBConnection() as PoolConnection;
    const [result] = await connection
      .execute(sql, [reviewId, social_accounts_uid]);

    return result;
  } catch (err) {
    throw err;
  }
}

async function createReviewLikeNotification(
  recipientSocialAccountsUID: string,
  initiatorUsername: string,
  initiatorIconURL: string,
  movieId: string,
  connection: PoolConnection
): Promise<void> {
  const notificationModelsId = uuidv4().replace(/-/g, '');
  const createNotificationModelsSql = `
    INSERT INTO movie_view.notification_models (id, notification_templates_id, data) VALUES
    (UNHEX(?), 1, ?);
  `;
  const createNotificationModelsSqlData = [
    notificationModelsId,
    JSON.stringify({
      username: initiatorUsername,
      movieId: movieId,
      icon: initiatorIconURL || '',
    })
  ];

  const createNotificationModelsSocialAccountsSql = `
    INSERT INTO movie_view.notification_models_social_accounts (id, notification_models_id, social_accounts_uid) VALUES
    (UNHEX(?), UNHEX(?), ?);
  `;
  const createNotificationModelsSocialAccountsSqlData = [
    uuidv4().replace(/-/g, ''),
    notificationModelsId,
    recipientSocialAccountsUID,
  ];

  try {
    const [createNotificationModelsSqlResult] = await connection.execute<ResultSetHeader>(
      createNotificationModelsSql, 
      createNotificationModelsSqlData
    );
    if (createNotificationModelsSqlResult.affectedRows === 0) {
      throw new Error('Failed to create notification model');
    }

    const [createNotificationModelsSocialAccountsSqlResult] =  await connection.execute<ResultSetHeader>(
      createNotificationModelsSocialAccountsSql, 
      createNotificationModelsSocialAccountsSqlData
    );
    if (createNotificationModelsSocialAccountsSqlResult.affectedRows === 0) {
      throw new Error('Failed to create notification model social accounts');
    }
  } catch (err) {
    throw err;
  }
}

async function getReviewWriterSocialAccountsUID(
  reviewId: string,
  connection: PoolConnection
) {
  const sql = `
    SELECT social_accounts_uid
    FROM movie_view.reviews
    WHERE HEX(id) = ?;
  `;

  try {
    const [result] = await connection.execute<RowDataPacket[]>(sql, [reviewId]);
    if (result.length === 0) {
      return null;
    }

    if (!result[0].social_accounts_uid) {
      return null;
    }

    return result[0].social_accounts_uid;
  } catch (err) {
    throw err;
  }
}


function getMovieIdFromReferer(referer: string): string {
  const parts = referer.split('/');
  return parts[parts.length - 1];
}