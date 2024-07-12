import { extname, join } from 'path';
import { getServerSession } from 'next-auth/next';
import { stat, mkdir, writeFile } from 'fs/promises';
import { authOptions } from '@/lib/authOptions';
import { formatUserId } from '@/utils/formatUserId';
import { dbConnectionPoolAsync } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_\u0600-\u06FF.]/g, '_');
}

export async function uploadImage(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get('profilePicture') as unknown as File | null;
    if (!file) {
      throw new Error('File blob is required.');
    }

    // 파일 유형 및 크기 검증 (선택 사항)
    const fileExtension = extname(file.name).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error('Invalid file type.');
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadDir: string = join(process.cwd(), '/public/images/profile');

    try {
      await stat(uploadDir);
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        await mkdir(uploadDir, { recursive: true });
      } else {
        console.error('파일 업로드 중 디렉토리 생성 오류\n', e);
        throw new Error('Something went wrong.');
      }
    }

    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const originalFilename = file.name.replace(/\.[^/.]+$/, '');
    const sanitizedFilename = sanitizeFilename(originalFilename);
    const filename = `${sanitizedFilename}_${uniqueSuffix}${fileExtension}`;
    const fileDirectory = join('/images/profile', filename);

    await writeFile(join(uploadDir, filename), buffer);

    return fileDirectory;
  } catch (e) {
    console.error('파일 업로드 중 오류 발생\n', e);
    throw new Error('Something went wrong.');
  }
}

export async function PUT(req: NextRequest, res: NextResponse) {
  try {
    const session = await getServerSession({ req, res, ...authOptions });
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = formatUserId(session.provider, session.uid);
    if (!userId) {
      return NextResponse.json({ message: 'Invalid User' }, { status: 401 });
    }
    const beforeData = await getExtraData(userId);
    let filePath = beforeData.filePath;
    let username = beforeData.username;

    const req_copy = req.clone();

    const formData = await req_copy.formData();
    if (formData.get('profilePicture') != null) {
      filePath = await uploadImage(req);
    }
    if (formData.get('username') != null) {
      username = formData.get('username');
    }

    executeQury(userId, username, filePath);
  } catch (err: any) {
    console.error('Error in PUT request\n');
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  return NextResponse.json(
    { done: 'ok', message: '프로필 변경 성공' },
    { status: 200 }
  );
}

export async function getExtraData(userId: string) {
  const connection = await dbConnectionPoolAsync.getConnection();

  try {
    const [rows]: [any[], any] = await connection.execute(
      'SELECT extra_data FROM social_accounts WHERE uid = ?',
      [userId]
    );

    if (rows.length > 0) {
      const extraDataString = rows[0].extra_data;
      const extraData = JSON.parse(extraDataString);

      return extraData;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error('Error parsing extra_data:' + error);
  } finally {
    connection.release();
  }
}

export async function executeQury(
  userId: string,
  username: string,
  filePath: string
) {
  const connection = await dbConnectionPoolAsync.getConnection();

  try {
    await connection.execute('SET SQL_SAFE_UPDATES=0');

    let updateQuery =
      'UPDATE movie_view.social_accounts SET extra_data = \'{"username":"';
    updateQuery += username;
    updateQuery += '","filePath":"';
    updateQuery += filePath;
    updateQuery += '"}\'';
    updateQuery += " WHERE uid = '";
    updateQuery += userId;
    updateQuery += "';";
    console.log(updateQuery);

    const [result] = await connection.execute(updateQuery);

    console.log('Update successful:', result);
  } catch (error) {
    console.error('Error execute qury:', error);
    throw new Error('Error execute qury: ' + error);
  } finally {
    connection.release();
  }
}
