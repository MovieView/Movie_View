import { NextRequest, NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db';
import { PoolConnection } from 'mysql2/promise';
import { formatUserId, replaceSpecialCharactersWithRandomAlphanumberic } from '@/utils/authUtils';
import { setUserNickname } from '@/services/userServices';


export const POST = async (req: NextRequest, res: NextResponse) => {
  const { nickname, userId, provider } = await req.json();
  if (!nickname) {
    return new Response(
      JSON.stringify({ error: '닉네임은 필수로 설정해야 합니다.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (!userId || !provider) {
    return new Response(
      JSON.stringify({ error: '사용자 정보가 올바르지 않습니다.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const socialAccountUID = formatUserId(provider, userId);
  if (!socialAccountUID) {
    return new Response(
      JSON.stringify({ error: '사용자 정보가 올바르지 않습니다.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  const sanitizedNickname = replaceSpecialCharactersWithRandomAlphanumberic(nickname.trim().substring(0, 20));

  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection();
    await connection.beginTransaction();

    const queryResult = await setUserNickname(
      socialAccountUID,
      sanitizedNickname,
      connection
    );
    if (!queryResult) {
      await connection.rollback();
      connection.release();

      return new Response(
        JSON.stringify({ error: '닉네임 업데이트 실패' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    await connection.commit();
    connection.release();

    return new Response(JSON.stringify({ message: '닉네임 업데이트 완료' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    await connection?.rollback();
    connection?.release();

    return new Response(JSON.stringify({ error: '닉네임 업데이트 실패' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};