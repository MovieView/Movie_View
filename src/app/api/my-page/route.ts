import { dbConnectionPoolAsync } from '@/lib/db';
import { authOPtions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth/next';
import formidable from 'formidable';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

// PUT 메서드를 처리하는 함수
export async function PUT(req: NextRequest): Promise<Response> {
  const res = NextResponse.next();
  try {
    // req와 res를 NextApiRequest와 NextApiResponse로 변환
    const session = await getServerSession(req as any, res as any, authOPtions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const form = new formidable.IncomingForm({
      uploadDir: path.join(process.cwd(), 'public/uploads'),
      keepExtensions: true,
    });

    return new Promise((resolve) => {
      form.parse(req as any, async (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          resolve(NextResponse.json({ message: 'Form parsing error' }, { status: 500 }));
          return;
        }

        const { userName } = fields;
        let filePath = null;

        if (files.profilePicture) {
          const file = Array.isArray(files.profilePicture) ? files.profilePicture[0] : files.profilePicture;
          filePath = `/uploads/${path.basename(file.filepath)}`;
        }

        let connection;
        try {
          connection = await dbConnectionPoolAsync.getConnection();

          const sql = `UPDATE social_accounts SET extra_data = JSON_SET(extra_data, '$.username', ?, '$.filePath', ?) WHERE users_id = ?`;
          await connection.execute(sql, [userName, filePath, session.user.id]);

          resolve(NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 }));
        } catch (error) {
          console.error('Database error:', error);
          resolve(NextResponse.json({ message: 'Database error' }, { status: 500 }));
        } finally {
          if (connection) {
            connection.release();
          }
        }
      });
    });
  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
