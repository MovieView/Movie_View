import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import BigNum from "bignum";

export async function GET(req: Request) {
  try {
    // @ts-ignore
    const { username } = req.query;

    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || "3306"),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });

    const [results] = await connection.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM users WHERE nickname = ?",
      [username]
    );
    const count = results[0].count;

    return new Response(JSON.stringify({ exists: count > 0 }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error checking user existence:", error);
    return new Response(JSON.stringify({ exists: false }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export async function POST(req: Request) {
  try {
    const { username, filePath, provider } = await req.json();

    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || "3306"),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });

    const [results] = await connection.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM users WHERE nickname = ?",
      [username]
    );
    const count = results[0].count;

    const generateUniqueInt = () => {
      const timestamp = Date.now(); // 현재 시간을 밀리초 단위로 얻음
      const randomNum = Math.floor(Math.random() * 1000); // 0부터 999까지의 난수 생성
      return timestamp * 1000 + randomNum; // 고유한 정수 생성
    };

    const userId = generateUniqueInt();

    // 사용자가 존재하지 않으면 데이터베이스에 추가
    if (count === 0) {
      await connection.execute(
        "INSERT INTO users (id, nickname) VALUES (?, ?)",
        [userId, username]
      );
    }

    const [myAccount] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE nickname = ?",
      [username]
    );

    console.log(myAccount);

    let myAccountId;

    if (myAccount.length) myAccountId = myAccount[0].id;
    const socialAccountsId = Date.now();

    const uid = uuidv4();
    const extraData = JSON.stringify({ username, filePath });

    const formProviderId = (provider: string) => {
      switch (provider) {
        case "github":
          return 0;
        case "kakao":
          return 1;
        case "naver":
          return 2;
      }
    };

    const formatDateToMySQL = (date: Date) => {
      const pad = (num: number) => (num < 10 ? "0" : "") + num;
      return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1) +
        "-" +
        pad(date.getDate()) +
        " " +
        pad(date.getHours()) +
        ":" +
        pad(date.getMinutes()) +
        ":" +
        pad(date.getSeconds())
      );
    };

    const providerId = formProviderId(provider);
    const lastLogin = formatDateToMySQL(new Date());

    const [social_accounts] = await connection.execute<ResultSetHeader>(
      "INSERT INTO social_accounts (id, users_id, providers_id, uid, last_login, extra_data) VALUES (?, ?, ?, ?, ?, ?)",
      [socialAccountsId, myAccountId, providerId, uid, lastLogin, extraData]
    );

    console.log(social_accounts);

    return new Response(JSON.stringify(""), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error saving user:", error);
    return new Response(JSON.stringify({ error: "Failed to save user" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
