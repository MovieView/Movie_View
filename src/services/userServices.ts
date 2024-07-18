import { 
  FieldPacket, 
  PoolConnection, 
  ResultSetHeader, 
  RowDataPacket 
} from 'mysql2/promise';
import { NextRequest } from 'next/server';
import { extname, posix } from 'path';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';


interface IUserData {
  username: string;
  filepath: string;
}

export async function addUser(
  username: string,
  userId: number,
  connection: PoolConnection
) : Promise<number | boolean>{
  try {
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO users (id, nickname) VALUES (?, ?)',
      [userId, username]
    );
    if (result.affectedRows === 0) {
      return false;
    }
    return result.insertId;
  } catch (err) {
    throw err;
  }
}

export async function addSocialAccount(
  socialAccountsUID: string,
  userId: number,
  providerId: number,
  extraData: string,
  lastLogin: string,
  connection: PoolConnection
) {
  const sql = `
    INSERT INTO social_accounts (users_id, providers_id, uid, last_login, extra_data) 
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    const queryResult = await connection.execute<ResultSetHeader>(
      sql,
      [userId, providerId, socialAccountsUID, lastLogin, extraData]
    );
    if (queryResult[0].affectedRows === 0) {
      return false;
    }
    return true;
  } catch (err) {
    throw err;
  }
}

export async function setUserNickname(
  socialAccountsUID: string,
  nickname: string,
  connection: PoolConnection
) : Promise<boolean> {
  const sql = `
    UPDATE users AS u
    JOIN social_accounts AS sa ON u.id = sa.users_id
    SET u.nickname = ?, u.updated_at = NOW()
    WHERE sa.uid = ?
  `;

  try {
    const [result] = await connection.execute<ResultSetHeader>(sql, [
      nickname,
      socialAccountsUID,
    ]);
    if (result.affectedRows === 0) {
      return false;
    }
    return true;
  } catch (err) {
    throw err;
  }
}

export async function getUserIDBySocialAccountsUID(uid: string, connection: PoolConnection) {
  const sql = `SELECT users_id AS userId, uid FROM social_accounts WHERE uid=?`;
  const values = [uid];

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql,
      values
    );
    return result[0];
  } catch (err) {
    throw err;
  }
}

export async function getUserProfilePictureBySocialAccountsUID(
  socialAccountsUID: string,
  connection: PoolConnection
) {
  const sql = `
    SELECT JSON_UNQUOTE(JSON_EXTRACT(extra_data, '$.filepath')) AS filepath
    FROM social_accounts
    WHERE uid = ?
  `;
  try {
    const [result] = await connection.execute<RowDataPacket[]>(
      sql, 
      [socialAccountsUID]
    );
    if (!result.length) {
      return null;
    }
    return result[0].filepath;
  } catch (err) {
    throw err;
  }
}

export async function getUserSocialAccountsUIDByReviewId(
  reviewId: string,
  connection: PoolConnection
) {
  const sql = `
    SELECT social_accounts_uid
    FROM movie_view.reviews
    WHERE HEX(id) = ?;
  `;

  try {
    const [result] = await connection.execute<RowDataPacket[]>(sql, [reviewId]);
    if (result.length === 0) {
      return null;
    }

    if (!result[0].social_accounts_uid) {
      return null;
    }

    return result[0].social_accounts_uid;
  } catch (err) {
    throw err;
  }
}

export async function getUserSocialAccountsExtraData(
  userId: string, 
  connection: PoolConnection
) : Promise<IUserData | null> {
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

export async function updateUserSocialAccounts(
  userId: string, 
  username: string, 
  filepath: string, 
  connection: PoolConnection
) : Promise<void> {
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

export const getSocialAccountsExtraData = async (uid: string, connection: PoolConnection) => {
  const sql = `SELECT extra_data FROM social_accounts WHERE uid=?`;
  const values = [uid];

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql,
      values
    );
    if (!result.length) {
      return null;
    }
    return JSON.parse(result[0].extra_data);
  } catch (err) {
    throw err;
  }
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_\u0600-\u06FF.]/g, '_');
}

export async function uploadImage(req: NextRequest) : Promise<string> {
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