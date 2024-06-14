import mysql, { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = new URLSearchParams(url.searchParams).get('userId');
    const provider = new URLSearchParams(url.searchParams).get('provider');

    if (!userId || !provider) {
      throw new Error('Username is missing in query parameters');
    }

    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });

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

    const [results] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM users u LEFT JOIN social_accounts s ON u.id = s.users_id WHERE s.uid = ?`,
      [formUid(provider)]
    );

    const count = results[0].count;

    return new Response(JSON.stringify({ exists: count > 0 }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error checking user existence:', error);
    return new Response(JSON.stringify({ exists: false }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(req: Request) {
  try {
    const { username, filePath, provider, userId } = await req.json();

    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });

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

    const [results] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM users u LEFT JOIN social_accounts s ON u.id = s.users_id WHERE s.uid = ?`,
      [formUid(provider)]
    );
    const count = results[0].count;

    const generateUniqueInt = () => {
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000);
      return timestamp * 1000 + randomNum;
    };

    const usersId = generateUniqueInt();

    let myAccountId;

    if (count === 0) {
      const [result] = await connection.execute<ResultSetHeader>(
        'INSERT INTO users (id, nickname) VALUES (?, ?)',
        [usersId, username]
      );

      myAccountId = result.insertId;
    }

    const extraData = JSON.stringify({ username, filePath });

    const formProviderId = (provider: string) => {
      switch (provider) {
        case 'github':
          return 0;
        case 'kakao':
          return 1;
        case 'google':
          return 2;
      }
    };

    const formatDateToMySQL = (date: Date) => {
      const pad = (num: number) => (num < 10 ? '0' : '') + num;
      return (
        date.getFullYear() +
        '-' +
        pad(date.getMonth() + 1) +
        '-' +
        pad(date.getDate()) +
        ' ' +
        pad(date.getHours()) +
        ':' +
        pad(date.getMinutes()) +
        ':' +
        pad(date.getSeconds())
      );
    };

    const providerId = formProviderId(provider);
    const lastLogin = formatDateToMySQL(new Date());

    // social_accounts
    await connection.execute(
      'INSERT INTO social_accounts (users_id, providers_id, uid, last_login, extra_data) VALUES (?, ?, ?, ?, ?)',
      [myAccountId, providerId, formUid(provider), lastLogin, extraData]
    );

    return new Response(JSON.stringify({ uid: formUid(provider) }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error saving user:', error);
    return new Response(JSON.stringify({ error: 'Failed to save user' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
