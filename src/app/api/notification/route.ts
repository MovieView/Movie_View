import { authOptions } from "@/lib/authOptions";
import { dbConnectionPoolAsync } from "@/lib/db";
import { formatUserId } from "@/utils/formatUserId";
import { PoolConnection, RowDataPacket } from "mysql2/promise";
import { getServerSession } from "next-auth";


interface INotification extends RowDataPacket{
  id: string;
  template_data: string;
  created_at: string;
  url_template: string;
  template_message: string;
  type_id: number;
  type_name: string;
  checked: boolean;
}

interface IUnreadCount extends RowDataPacket {
  unread_count: number;
}

interface ITotalCount extends RowDataPacket {
  total_count: number;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let quantity : string | number | null = searchParams.get("quantity");
  let page : string | number | null = searchParams.get("page");

  if (quantity === 'navbar') {
    quantity = 5;
  } else {
    quantity = 10;
  }

  if (page && !isNaN(parseInt(page))) {
    page = parseInt(page);
  } else {
    page = 1;
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
    SELECT 
        HEX(nm.id) AS id,
        nm.data AS template_data,
        nm.created_at AS created_at,
        ntemp.url_template AS url_template, 
        ntemp.template AS template_message,
        ntype.id AS type_id, 
        ntype.name AS type_name,
        nmsa.checked AS checked
    FROM notification_models_social_accounts AS nmsa
    LEFT JOIN notification_models AS nm ON nmsa.notification_models_id = nm.id
    LEFT JOIN notification_templates AS ntemp ON nm.notification_templates_id = ntemp.id
    LEFT JOIN notification_types AS ntype ON ntemp.notification_types_id = ntype.id
    WHERE nmsa.social_accounts_uid = ?
    ORDER BY nm.created_at DESC
    LIMIT ${quantity} OFFSET ${quantity * (page - 1)}
  `;

  const sqlQueryStatementForUnreadCount = `
    SELECT 
        COUNT(*) AS unread_count
    FROM notification_models_social_accounts
    WHERE social_accounts_uid = ? AND checked = 0
  `;

  const sqlQueryStatementForTotalCount = `
    SELECT 
        COUNT(*) AS total_count
    FROM notification_models_social_accounts
    WHERE social_accounts_uid = ?
  `;

  const connection : PoolConnection = await dbConnectionPoolAsync.getConnection();
  try {
    const [rows] = await connection.query<INotification[]>(sqlQueryStatement, [socialAccountsUID]);
    if (rows.length === 0) {
      connection.release();
      return new Response(JSON.stringify({ message: "No data" }), {
        status: 404,
      });
    }

    const [unreadCountRows] = await connection.query<IUnreadCount[]>(sqlQueryStatementForUnreadCount, [socialAccountsUID]);
    const [totalCountRows] = await connection.query<ITotalCount[]>(sqlQueryStatementForTotalCount, [socialAccountsUID]);

    connection.release();
    return new Response(JSON.stringify({
      unreadCount: unreadCountRows[0].unread_count, 
      rows,
      currentPage: page,
      totalPage: Math.ceil(totalCountRows[0].total_count / quantity) || 1,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Internal server error:", error);
    connection.release();
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
};