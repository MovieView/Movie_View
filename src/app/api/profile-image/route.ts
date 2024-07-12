import { dbConnectionPoolAsync } from '@/lib/db';
import { NextRequest } from 'next/server';

export const POST = async (req: NextRequest) => {
  const connection = await dbConnectionPoolAsync.getConnection();
  try {
    const { userId, provider } = await req.json();

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

    const sql = `
      SELECT JSON_UNQUOTE(JSON_EXTRACT(extra_data, '$.filepath')) AS filepath
      FROM social_accounts
      WHERE uid = ?
    `;

    const [result] = await connection.execute(sql, [formUid(provider)]);
    connection.release();
    if (!result) {
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
          filepath: result,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (err) {
    connection.release();
    return new Response(
      JSON.stringify({ error: '프로필 사진 불러오기 실패' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
