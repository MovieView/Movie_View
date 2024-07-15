import { getDBConnection } from '@/lib/db';
import { formatUserId } from '@/utils/formatUserId';
import { getServerSession } from 'next-auth';
import { FieldPacket, RowDataPacket } from 'mysql2';
import { ICommentContent } from '@/models/comment.model';
import { authOptions } from '@/lib/authOptions';
import { PoolConnection } from 'mysql2/promise';

// 대댓글 삭제
export async function DELETE(
  _req: Request,
  { params }: { params: { commentId: number } }
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
      await connection.rollback();
      connection.release();

      return new Response(JSON.stringify({ message: 'User does not exist.' }), {
        status: 404,
      });
    }

    await deleteCommentById(
      params.commentId, 
      user.userId, 
      connection
    );

    await connection.commit();
    connection.release();

    return new Response(
      JSON.stringify({ message: 'Comment has been deleted.' }),
      {
        status: 200,
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

// 대댓글 수정
export async function PUT(
  req: Request,
  { params }: { params: { commentId: number } }
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
      await connection.rollback();
      connection.release();

      return new Response(JSON.stringify({ message: 'User does not exist.' }), {
        status: 404,
      });
    }

    // 대댓글 수정 내용 받아오기
    const data: ICommentContent = await req.json();

    // DB에서 데이터 수정
    await updateCommentById(
      params.commentId, 
      user.userId, 
      data.content, 
      connection
    );

    await connection.commit();
    connection.release();

    return new Response(
      JSON.stringify({ message: 'Comment has been updated.' }),
      {
        status: 200,
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

async function deleteCommentById(
  commentId: number, 
  userId: number, 
  connection: PoolConnection
) {
  const values: Array<string | number> = [commentId, userId];
  const sql = `DELETE FROM reviews_comments WHERE id=UNHEX(?) AND users_id=?`;

  try {
    const [result] = await connection.execute(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
}

async function updateCommentById(
  commentId: number,
  userId: number,
  content: string,
  connection: PoolConnection
) {
  const sql = `UPDATE reviews_comments SET content=? WHERE id=UNHEX(?) AND users_id=? `;
  const values: Array<string | number> = [content, commentId, userId];

  try {
    const [result] = await connection.execute(sql, values);
    return result;
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
