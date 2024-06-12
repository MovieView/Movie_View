import { v4 as uuidv4 } from "uuid";
import { Session } from "next-auth";
import { dbConnection } from "@/lib/db";

export const insertUserData = async (session: Session) => {
  const userId = BigInt(Date.now());
  const providerId = getProviderId(session.provider as string);
  const uid = uuidv4();
  const lastLogin = new Date().toISOString();
  const extraData = JSON.stringify({
    name: session.user?.name,
    profileImage: session.user?.image,
  });

  const query = `INSERT INTO your_table_name (users_id, providers_id, uid, last_login, extra_data) VALUES (?, ?, ?, ?, ?)`;

  return new Promise<void>((resolve, reject) => {
    dbConnection.query(
      query,
      [userId, providerId, uid, lastLogin, extraData],
      (error, results) => {
        if (error) {
          console.error("Error inserting user data into database:", error);
          return reject(error);
        }
        resolve();
      }
    );
  });
};

const getProviderId = (provider: string) => {
  switch (provider) {
    case "github":
      return 0;
    case "kakao":
      return 1;
    case "naver":
      return 2;
    default:
      return null;
  }
};
