import { authOptions } from "@/lib/authOptions";
import { getDBConnection } from "@/lib/db";
import { formatUserId } from "@/utils/formatUserId";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";
import { getServerSession } from "next-auth";


export async function DELETE(
  req: Request,
  { params }: { params: { notificationId: string } }
) {
  if (!params.notificationId) {
    return new Response("Bad Request", { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.provider && !session?.uid) {
    return new Response("Unauthorized", { status: 401 });
  }

  const socialAccountsUID : string | undefined = formatUserId(session.provider, session.uid);
  if (!socialAccountsUID) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sqlQueryStatement = `
    DELETE FROM notification_models_social_accounts
    WHERE social_accounts_uid=? AND notification_models_id=UNHEX(?)
  `;

  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection();
    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      sqlQueryStatement, 
      [socialAccountsUID, params.notificationId]
    );
    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
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
    await connection?.rollback();
    connection?.release();

    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}