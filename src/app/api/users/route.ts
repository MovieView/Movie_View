import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { formatUserId, replaceSpecialCharactersWithRandomAlphanumberic } from '@/utils/authUtils';
import { getDBConnection } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { PoolConnection } from 'mysql2/promise';
import { getUserSocialAccountsExtraData, updateUserSocialAccounts, uploadImage } from '@/services/userServices';


export async function PUT(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = formatUserId(session.provider, session.uid);
  if (!userId) {
    return NextResponse.json({ message: 'Invalid User' }, { status: 401 });
  }

  let connection : PoolConnection | undefined;
  try {
    connection = await getDBConnection();
    await connection.beginTransaction();

    const beforeData = await getUserSocialAccountsExtraData(userId, connection);
    if (!beforeData) {
      await connection.rollback();
      connection.release();
      return NextResponse.json({ error: '사용자 정보가 올바르지 않습니다.' }, { status: 400 });
    }

    let filepath = beforeData.filepath;
    let username = beforeData.username;

    const req_copy = req.clone();

    const formData = await req_copy.formData();
    if (formData.get('profilePicture') != null) {
      filepath = await uploadImage(req);
    }
    if (formData.get('username') != null) {
      username = replaceSpecialCharactersWithRandomAlphanumberic(
        (formData.get('username') as string).trim().slice(0, 20)
      );
    }

    await updateUserSocialAccounts(
      userId, 
      username, 
      filepath,
      connection
    );

    await connection.commit();
    connection.release();

    return NextResponse.json(
      { 
        done: 'ok', 
        message: '프로필 변경 성공' 
      }, 
      { status: 200 }
    );
  } catch (err: any) {
    await connection?.rollback();
    connection?.release();

    return NextResponse.json(
      { error: err.message }, 
      { status: 400 }
    );
  }
}