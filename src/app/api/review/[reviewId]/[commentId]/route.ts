import { dbConnectionPoolAsync } from '@/lib/db';
import { formatUserId } from '@/utils/formatUserId';
import { getServerSession } from 'next-auth';
import { FieldPacket, RowDataPacket } from 'mysql2';
import { ICommentContent } from '@/models/comment.model';
import { authOptions } from '@/lib/authOptions';

// 대댓글 삭제
export async function DELETE(
  _req: Request,
  { params }: { params: { commentId: number } }
) {
  try {
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

    const user = await getUser(formattedUid);

    if (!user) {
      return new Response(JSON.stringify({ message: 'User does not exist.' }), {
        status: 404,
      });
    }

    await deleteCommentById(params.commentId, user.userId);

    return new Response(
      JSON.stringify({ message: 'Comment has been deleted.' }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error(err);
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
  try {
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

    const user = await getUser(formattedUid);

    if (!user) {
      return new Response(JSON.stringify({ message: 'User does not exist.' }), {
        status: 404,
      });
    }

    // 대댓글 수정 내용 받아오기
    const data: ICommentContent = await req.json();

    // DB에서 데이터 수정
    await updateCommentById(params.commentId, user.userId, data.content);

    return new Response(
      JSON.stringify({ message: 'Comment has been updated.' }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

async function deleteCommentById(commentId: number, userId: number) {
  const values: Array<string | number> = [commentId, userId];
  const sql = `DELETE FROM reviews_comments WHERE id=UNHEX(?) AND users_id=?`;

  const connection = await dbConnectionPoolAsync.getConnection();
  try {
    const [result] = await connection.execute(sql, values);
    connection.release();
    return result;
  } catch (err) {
    connection.release();
    console.error(err);
    throw err;
  }
}

async function updateCommentById(
  commentId: number,
  userId: number,
  content: string
) {
  const sql = `UPDATE reviews_comments SET content=? WHERE id=UNHEX(?) AND users_id=? `;
  const values: Array<string | number> = [content, commentId, userId];
  const connection = await dbConnectionPoolAsync.getConnection();
  try {
    const [result] = await connection.execute(sql, values);
    connection.release();
    return result;
  } catch (err) {
    connection.release();
    console.error(err);
    throw err;
  }
}

async function getUser(uid: string) {
  const sql = `SELECT users_id AS userId, uid FROM social_accounts WHERE uid=?`;
  const values = [uid];

  const connection = await dbConnectionPoolAsync.getConnection();
  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql,
      values
    );
    connection.release();
    return result[0];
  } catch (err) {
    connection.release();
    console.error(err);
    throw err;
  }
}
