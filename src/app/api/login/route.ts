import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const username = new URLSearchParams(url.searchParams).get("username");

    if (!username) {
      throw new Error("Username is missing in query parameters");
    }

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
    const { username, filePath, provider, userId } = await req.json();

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
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000);
      return timestamp * 1000 + randomNum;
    };

    const usersId = generateUniqueInt();

    // 사용자가 존재하지 않으면 데이터베이스에 추가
    if (count === 0) {
      const [result] = await connection.execute<ResultSetHeader>(
        "INSERT INTO users (id, nickname) VALUES (?, ?)",
        [usersId, username]
      );
    }

    const [myAccount] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE nickname = ?",
      [username]
    );

    let myAccountId;

    if (myAccount.length) myAccountId = myAccount[0].id;

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
    const socialAccountsId = uuidv4().replace(/-/g, "");

    // social_accounts
    await connection.execute(
      "INSERT INTO social_accounts (users_id, providers_id, uid, last_login, extra_data) VALUES (?, ?, ?, ?, ?)",
      [myAccountId, providerId, userId, lastLogin, extraData]
    );

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
