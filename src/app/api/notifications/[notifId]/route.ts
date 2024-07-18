import { authOptions } from "@/lib/authOptions";
import { getDBConnection } from "@/lib/db";
import { 
  deleteNotificationModelSocialAccounts, 
  updateNotificationModelSocialAccountsAsRead 
} from "@/services/notificationServices";
import { formatUserId } from "@/utils/authUtils";
import { PoolConnection } from "mysql2/promise";
import { getServerSession } from "next-auth";


export async function DELETE(
  req: Request,
  { params }: { params: { notifId: string } }
) {
  if (!params.notifId) {
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

  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection();
    await connection.beginTransaction();

    const queryResult = await deleteNotificationModelSocialAccounts(
      params.notifId,
      socialAccountsUID,
      connection
    );
    if (!queryResult) {
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

export async function PUT(
  req: Request,
  { params }: { params: { notifId: string } }
) {
  if (!params.notifId) {
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


  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection();
    await connection.beginTransaction();

    const queryResult : boolean = await updateNotificationModelSocialAccountsAsRead(
      params.notifId,
      socialAccountsUID,
      connection
    );
    if (!queryResult) {
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