import { extname, posix } from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { formatUserId } from '@/utils/formatUserId';
import { getDBConnection } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { PoolConnection } from 'mysql2/promise';


interface IUserData {
  username: string;
  filepath: string;
}

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
    const beforeData = await getExtraData(userId, connection);
    let filepath = beforeData.filepath;
    let username = beforeData.username;

    const req_copy = req.clone();

    const formData = await req_copy.formData();
    if (formData.get('profilePicture') != null) {
      filepath = await uploadImage(req);
    }
    if (formData.get('username') != null) {
      username = formData.get('username');
    }

    executeQury(
      userId, 
      username, 
      filepath,
      connection
    );
    connection?.release();
  } catch (err: any) {
    connection?.release();
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  return NextResponse.json(
    { done: 'ok', message: '프로필 변경 성공' },
    { status: 200 }
  );
}

async function getExtraData(userId: string, connection: PoolConnection) {
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
  }
}

async function executeQury(
  userId: string, 
  username: string, 
  filepath: string, 
  connection: PoolConnection
) {
  try {
    await connection.execute('SET SQL_SAFE_UPDATES=0');

    let updateQuery =
      'UPDATE movie_view.social_accounts SET extra_data = ? WHERE uid = ?';
    let data: IUserData = {
      username: '',
      filepath: '',
    };
    if (username) {
      data['username'] = username;
    }
    if (filepath) {
      data['filepath'] = filepath;
    }

    await connection.execute(updateQuery, [
      JSON.stringify(data),
      userId,
    ]);
  } catch (error) {
    throw new Error('Error execute qury: ' + error);
  }
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_\u0600-\u06FF.]/g, '_');
}

async function uploadImage(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get('profilePicture') as unknown as File | null;
    if (!file) {
      throw new Error('File blob is required.');
    }

    const fileExtension = extname(file.name).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error('Invalid file type.');
    }

    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const originalFilename = file.name.replace(/\.[^/.]+$/, '');
    const sanitizedFilename = sanitizeFilename(originalFilename);
    const filename = `${sanitizedFilename}_${uniqueSuffix}${fileExtension}`;
    const fileDirectory = posix.join('images/profile', filename);

    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_KEY!,
      },
    });

    let url = 'https://' + process.env.AWS_S3_NAME + '.s3.';
    url += process.env.AWS_REGION + '.amazonaws.com/';
    url += fileDirectory;

    const uploadParams = {
      Bucket: process.env.AWS_S3_NAME!,
      Key: fileDirectory!,
      Body: file,
      ContentType: file.type!,
    };

    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    try {
      upload.done();
      return url;
    } catch (e) {
      throw new Error('S3 버킷 업로드 중 오류 발생');
    }
  } catch (e) {
    throw new Error('Something went wrong.');
  }
}