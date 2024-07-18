import { getDBConnection } from '@/lib/db';
import { FieldPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { formatUserId } from '@/utils/authUtils';
import { v4 as uuidv4 } from 'uuid';
import { ICommentContent } from '@/models/comment.model';
import { PoolConnection } from 'mysql2/promise';


export async function GET(
  req: Request,
) {
  const searchParams = new URL(req.url).searchParams;
  let page = searchParams.get('page') ?? 1;
  let quantity = searchParams.get('quantity') ?? 8;

  if (typeof page === 'string') {
    page = parseInt(page, 10);
  } else {
    page = 1;
  }

  if (typeof quantity === 'string') {
    quantity = parseInt(quantity, 10);
  } else {
    quantity = 8;
  }

  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection() as PoolConnection;
    const comments : RowDataPacket[] = await getComments(
      page, 
      quantity, 
      connection
    );
    
    connection.release();
    return new Response(JSON.stringify(comments), {
      status: 200,
    });
  } catch (err) {
    await connection?.rollback();
    connection?.release();
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { reviewId: string, movieId: string } }
) {
  const session = await getServerSession(authOptions);

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

    await addComment(
      params.reviewId, 
      user.userId, 
      data.content,
      connection
    );

    await createReviewCommentNotification(
      connection, 
      user.userId, 
      params.reviewId,
      params.movieId
    );

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

async function getReviewWriterDataByReviewId(reviewId: string, connection: PoolConnection) {
  const sql = `
    SELECT extra_data FROM social_accounts 
    WHERE HEX(id)=(SELECT HEX(social_accounts_uid) FROM reviews WHERE id=UNHEX(?))
  `;
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

async function getComments(
  page: number, 
  quantity: number,
  connection: PoolConnection
) : Promise<RowDataPacket[]> {
  const sql = `SELECT * FROM reviews_comments ORDER BY createdAt DESC LIMIT ?, ?`;
  const values = [page, quantity];

  try {
    const [result] = await connection.execute<RowDataPacket[]>(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
}

const createReviewCommentNotification = async (
  connection: PoolConnection, 
  userId: string, 
  reviewId: string,
  movieId: string
) => {
  const notificationModelsId = uuidv4().replace(/-/g, '');
  const createNotificationModelsSql = `
    INSERT INTO movie_view.notification_models (id, notification_templates_id, data) VALUES
    (UNHEX(?), 2, NULL);
  `;

  const reviewWriterData = await getReviewWriterDataByReviewId(reviewId, connection);
  const createNotificationModelsData = {
    username: reviewWriterData.username,
    movieId,
    icon: reviewWriterData.filepath,
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