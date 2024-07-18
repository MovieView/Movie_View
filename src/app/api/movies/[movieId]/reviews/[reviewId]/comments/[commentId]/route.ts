import { getDBConnection } from '@/lib/db';
import { formatUserId } from '@/utils/authUtils';
import { getServerSession } from 'next-auth';
import { FieldPacket, RowDataPacket } from 'mysql2';
import { ICommentContent } from '@/models/comment.model';
import { authOptions } from '@/lib/authOptions';
import { PoolConnection } from 'mysql2/promise';
import { deleteCommentById, updateCommentById } from '@/services/reviewCommentServices';
import { getUserIDBySocialAccountsUID } from '@/services/userServices';


export async function GET(
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
    const sql = `SELECT HEX(id) AS commentId, content FROM reviews_comments WHERE id=UNHEX(?)`;
    const values = [params.commentId];

    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql,
      values
    );

    connection.release();
    return new Response(JSON.stringify(result[0]), { status: 200 });
  } catch (err) {
    await connection?.rollback();
    connection?.release();

    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

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

    const user = await getUserIDBySocialAccountsUID(formattedUid, connection);
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

    const user = await getUserIDBySocialAccountsUID(formattedUid, connection);
    if (!user) {
      await connection.rollback();
      connection.release();

      return new Response(JSON.stringify({ message: 'User does not exist.' }), {
        status: 404,
      });
    }

    const data: ICommentContent = await req.json();

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