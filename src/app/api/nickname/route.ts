import { NextRequest, NextResponse } from 'next/server';
import { dbConnectionPoolAsync } from '@/lib/db';

export const POST = async (req: NextRequest, res: NextResponse) => {
  const connection = await dbConnectionPoolAsync.getConnection();
  try {
    const { nickname, userId, provider } = await req.json();

    const formUid = (provider: string) => {
      switch (provider) {
        case 'github':
          return 'github_' + userId;
        case 'kakao':
          return 'kakao_' + userId;
        case 'google':
          return 'google_' + userId;
      }
    };

    // 닉네임이 없는 경우
    if (!nickname) {
      return new Response(
        JSON.stringify({ error: '닉네임은 필수로 설정해야 합니다.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const sql = `
      UPDATE users AS u
      JOIN social_accounts AS sa ON u.id = sa.users_id
      SET u.nickname = ?, u.updated_at = NOW()
      WHERE sa.uid = ?
    `;

    const [result] = await connection.execute(sql, [
      nickname,
      formUid(provider),
    ]);

    connection.release();

    return new Response(JSON.stringify({ message: '닉네임 업데이트 완료' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Database error:', err);
    connection.release();
    return new Response(JSON.stringify({ error: '닉네임 업데이트 실패' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
