import { authOptions } from "@/lib/authOptions";
import { dbConnectionPoolAsync } from "@/lib/db";
import { formatUserId } from "@/utils/formatUserId";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";
import { getServerSession } from "next-auth";


export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.provider && !session?.uid) {
    return new Response("Unauthorized", { status: 401 });
  }

  const socialAccountsUID : string | undefined = formatUserId(session.provider, session.uid);
  if (!socialAccountsUID) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sqlQueryStatement = `
    UPDATE notification_models_social_accounts
    SET checked=1
    WHERE social_accounts_uid=?
  `;
  const connection : PoolConnection = await dbConnectionPoolAsync.getConnection();
  await connection.beginTransaction();

  try {
    const [result] = await connection.query<ResultSetHeader>(sqlQueryStatement, [socialAccountsUID]);
    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ message: "No data" }), {
        status: 404,
      });
    }

    await connection.commit();
    connection.release();

    return new Response(JSON.stringify({ message: "Success" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error("Internal server error:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}