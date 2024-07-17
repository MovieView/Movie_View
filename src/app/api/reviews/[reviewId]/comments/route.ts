import { getDBConnection } from '@/lib/db';
import { FieldPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { formatUserId } from '@/utils/authUtils';
import { v4 as uuidv4 } from 'uuid';
import { ICommentContent } from '@/models/comment.model';
import { PoolConnection } from 'mysql2/promise';

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

    const count = await commentsCount(params.reviewId, connection);
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

    const user = await getUser(formattedUid, connection);
    if (!user) {
      return new Response(JSON.stringify({ message: 'User does not exist.' }), {
        status: 404,
      });
    }

    const data: ICommentContent = await req.json();

    const movieId = await getMoviesIdByReviewId(params.reviewId, connection);
    if (!movieId) {
      await connection.rollback();
      connection.release();

      return new Response(JSON.stringify({ message: 'Review does not exist.' }), {
        status: 404,
      });
    }

    await addComment(
      params.reviewId, 
      user.userId, 
      data.content,
      connection
    );

    const reviewWriterUID = await getSocialAccountsUIDByReviewId(params.reviewId, connection);
    const {username, filepath} = await getSocialAccountsUsername(formattedUid, connection);
    
    if (reviewWriterUID && username) {
      await createReviewCommentNotification(
        connection, 
        filepath,
        username,
        reviewWriterUID,
        params.reviewId,
        movieId
      );
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
    console.log(err);

    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

async function getComments(
  reviewId: string,
  maxResults: number, 
  page: number,
  connection: PoolConnection
) {
  const offset = maxResults * (page - 1);
  const values: Array<number | string> = [reviewId, offset, maxResults];
  const sql = `SELECT HEX(rc.id) AS id, rc.content, s.uid AS userId,
                REPLACE(JSON_EXTRACT(s.extra_data, '$.filepath'), '"', '') AS filePath,
                REPLACE(JSON_EXTRACT(s.extra_data, '$.username'), '"', '') AS nickname, 
                rc.created_at AS createdAt, rc.updated_at AS updatedAt
                FROM reviews_comments AS rc
                LEFT JOIN users AS u ON u.id = rc.users_id
                LEFT JOIN social_accounts AS s ON rc.users_id = s.users_id
                WHERE HEX(rc.reviews_id) = ?
                ORDER BY createdAt
                LIMIT ?, ?`;

  try {
    const [result] = await connection.execute(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
}

async function addComment(
  reviewId: string, 
  userId: string, 
  content: string,
  connection: PoolConnection
) {
  const id = uuidv4().replace(/-/g, '');
  const sql = `INSERT INTO reviews_comments (id, users_id, reviews_id, content) VALUES(UNHEX(?), ?, UNHEX(?), ?)`;
  const values = [id, userId, reviewId, content];

  try {
    const [result] = await connection.execute(sql, values);
    return (result as ResultSetHeader).affectedRows;
  } catch (err) {
    throw err;
  }
}

async function getUser(uid: string, connection: PoolConnection) {
  const sql = `SELECT users_id AS userId, uid FROM social_accounts WHERE uid=?`;
  const values = [uid];

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql,
      values
    );
    return result[0];
  } catch (err) {
    throw err;
  }
}

async function commentsCount(reviewId: string, connection: PoolConnection) {
  const sql = `SELECT COUNT(*) AS totalCount FROM reviews_comments WHERE HEX(reviews_id)=?`;
  const values = [reviewId];

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql,
      values
    );
    return result[0];
  } catch (err) {
    throw err;
  }
}

async function getSocialAccountsUIDByReviewId(reviewId: string, connection: PoolConnection) {
  const sql = `SELECT social_accounts_uid AS uid FROM reviews WHERE id=UNHEX(?)`;
  const values = [reviewId];

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql,
      values
    );
    if (!result.length) {
      return null
    }
    return result[0].uid;
  } catch (err) {
    throw err;
  }
}

async function getMoviesIdByReviewId(reviewId: string, connection: PoolConnection) {
  const sql = `SELECT movies_id FROM reviews WHERE HEX(id)=?`;
  const values = [reviewId];

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql,
      values
    );
    if (!result.length) {
      return null;
    }
    return result[0].movies_id;
  } catch (err) {
    throw err;
  }
}

async function getReviewWriterDataByReviewId(reviewId: string, connection: PoolConnection) {
  const sql = `SELECT extra_data FROM social_accounts WHERE HEX(uid)=(SELECT HEX(social_accounts_uid) FROM reviews WHERE id=UNHEX(?))`;
  const values = [reviewId];

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql,
      values
    );
    return JSON.parse(result[0].extra_data);
  } catch (err) {
    throw err;
  }
}

const createReviewCommentNotification = async (
  connection: PoolConnection, 
  icon: string, 
  username: string,
  userId: string, 
  reviewId: string,
  movieId: string
) => {
  const notificationModelsId = uuidv4().replace(/-/g, '');
  const createNotificationModelsSql = `
    INSERT INTO movie_view.notification_models (id, notification_templates_id, data) VALUES
    (UNHEX(?), 2, ?);
  `;

  const reviewWriterData = await getReviewWriterDataByReviewId(reviewId, connection);
  const createNotificationModelsData = {
    username,
    movieId,
    icon
  }

  const createNotificationModelsSocialAccountsSql = `
    INSERT INTO movie_view.notification_models_social_accounts (id, notification_models_id, social_accounts_uid) VALUES
    (UNHEX(?), UNHEX(?), ?);
  `;
  const createNotificationModelsSocialAccountsSqlData = [
    uuidv4().replace(/-/g, ''),
    notificationModelsId,
    userId,
  ];

  try {
    const [createNotificationModelsResult] = await connection.execute<ResultSetHeader>(
      createNotificationModelsSql, 
      [notificationModelsId, JSON.stringify(createNotificationModelsData)]
    );
    if (!createNotificationModelsResult.affectedRows) {
      return false;
    }

    const [createNotificationModelsSocialAccountsResult] = await connection.execute<ResultSetHeader>(
      createNotificationModelsSocialAccountsSql,
      createNotificationModelsSocialAccountsSqlData
    );
    if (!createNotificationModelsSocialAccountsResult.affectedRows) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

const getSocialAccountsUsername = async (uid: string, connection: PoolConnection) => {
  const sql = `SELECT extra_data FROM social_accounts WHERE uid=?`;
  const values = [uid];

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql,
      values
    );
    if (!result.length) {
      return null;
    }
    return JSON.parse(result[0].extra_data);
  } catch (err) {
    throw err;
  }
}