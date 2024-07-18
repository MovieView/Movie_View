import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import KakaoProvider from 'next-auth/providers/kakao';
import GoogleProvider from 'next-auth/providers/google';
import { getDBConnection } from './db';
import { RowDataPacket } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { 
  formProviderId, 
  formatUserId, 
  generateUniqueInt 
} from '@/utils/authUtils';
import { formatDateToMySQL } from '@/utils/dateUtils';
import { v4 as uuidv4 } from 'uuid';
import { addSocialAccount, addUser } from '@/services/userServices';
import { createLoginNotification } from '@/services/notificationServices';


export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID as string,
      clientSecret: process.env.KAKAO_CLIENT_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      session.provider = token.provider as string;
      session.uid = token.sub as string;
      return session;
    },
    async signIn({ user, account }) {
      const userId = user.id;
      const provider = account?.provider as string;
      const filepath = user.image;
      let username = user.name;

      const officialUID = formatUserId(provider, userId);
      if (!officialUID) {
        return false;
      }

      const providerId = formProviderId(provider);
      if (providerId == undefined) {
        return false;
      }

      let connection : PoolConnection | undefined;
      try {
        connection = await getDBConnection();
        await connection.beginTransaction();
        const [results] = await connection.execute<RowDataPacket[]>(
          `SELECT COUNT(*) AS count FROM users u LEFT JOIN social_accounts s ON u.id = s.users_id WHERE s.uid = ?`,
          [officialUID]
        );
        const count : number = results[0].count;

        if (count >= 1) {
          const notifCreationResult = await createLoginNotification(connection, officialUID);
          if (!notifCreationResult) {
            await connection.rollback();
          } else {
            await connection.commit();
          }
          connection.release();
          return true;
        }

        const usersId : number = generateUniqueInt();
        if (!username) {
          username = 'user' + uuidv4().replace(/-/g, '');
        }

        if (count === 0) {
          const addUserQueryResult = await addUser(
            username, 
            usersId, 
            connection
          );
          if (!addUserQueryResult) {
            await connection.rollback();
            connection.release();
            return false;
          }
        }

        const extraData = JSON.stringify({ username, filepath });
        const lastLogin = formatDateToMySQL(new Date());

        const addSocialAccountQueryResult : boolean = await addSocialAccount(
          officialUID,
          usersId,
          providerId,
          extraData,
          lastLogin,
          connection
        );

        if (!addSocialAccountQueryResult) {
          await connection.rollback();
          connection.release();
          return false;
        }

        await connection.commit();
        connection.release();
        return true;
      } catch (err) {
        await connection?.rollback();
        connection?.release();
        return false;
      }
    },
  },
};