import { authOptions } from "@/lib/authOptions";
import { dbConnectionPoolAsync } from "@/lib/db";
import { formatUserId } from "@/utils/formatUserId";
import { PoolConnection } from "mysql2/promise";
import { getServerSession } from "next-auth";


export async function GET(req: Request) {
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
        ntype.name AS type_name   
    FROM notification_models_social_accounts AS nmsa
    LEFT JOIN notification_models AS nm ON nmsa.notification_models_id = nm.id
    LEFT JOIN notification_templates AS ntemp ON nm.notification_templates_id = ntemp.id
    LEFT JOIN notification_types AS ntype ON ntemp.notification_types_id = ntype.id
    WHERE nmsa.social_accounts_uid = ?
  `;

  const connection : PoolConnection = await dbConnectionPoolAsync.getConnection();
  try {
    const [rows] = await connection.query(sqlQueryStatement, [socialAccountsUID]);
    if (Array.isArray(rows) && rows.length === 0) {
      return new Response(JSON.stringify({ message: "No data" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Internal server error:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  } finally {
    connection.release();
  }
};