import { getDBConnection } from '@/lib/db';
import { getUserProfilePictureBySocialAccountsUID } from '@/services/userServices';
import { formatUserId } from '@/utils/authUtils';
import { PoolConnection } from 'mysql2/promise';
import { NextRequest } from 'next/server';


export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user-id');
  const provider = searchParams.get('provider');

  if (!provider) {
    return new Response(
      JSON.stringify({ error: '프로버이더 정보가 올바르지 않습니다.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (!userId) {
    return new Response(
      JSON.stringify({ error: '사용자 정보가 올바르지 않습니다.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const socialAccountsUID = formatUserId(provider, userId);
  if (!socialAccountsUID) {
    return new Response(
      JSON.stringify({ error: '사용자 정보가 올바르지 않습니다.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection();
    const filepath = await getUserProfilePictureBySocialAccountsUID(
      socialAccountsUID,
      connection
    );

    connection.release();

    if (!filepath) {
      return new Response(
        JSON.stringify({ error: '프로필이 존재하지 않습니다.' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          message: '프로필 사진 불러오기 완료',
          filepath,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (err) {
    connection?.release();
    return new Response(
      JSON.stringify({ error: '프로필 사진 불러오기 실패' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};