import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import KakaoProvider from 'next-auth/providers/kakao';
import GoogleProvider from 'next-auth/providers/google';
import { getDBConnection } from './db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { 
  formProviderId, 
  formatUserId, 
  generateUniqueInt 
} from '@/utils/authUtils';
import { formatDateToMySQL } from '@/utils/dateUtils';


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
      const username = user.name;
      const filepath = user.image;

      const officialUID = formatUserId(provider, userId);
      if (!officialUID) {
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
        const count = results[0].count;

        const usersId = generateUniqueInt();
        let myAccountId;

        if (count >= 1) {
          await connection.rollback();
          connection.release();
          return true;
        }

        if (count === 0) {
          const [result] = await connection.execute<ResultSetHeader>(
            'INSERT INTO users (id, nickname) VALUES (?, ?)',
            [usersId, username]
          );
          myAccountId = result.insertId;
        }

        const extraData = JSON.stringify({ username, filepath });

        const providerId = formProviderId(provider);
        const lastLogin = formatDateToMySQL(new Date());

        await connection.execute(
          'INSERT INTO social_accounts (users_id, providers_id, uid, last_login, extra_data) VALUES (?, ?, ?, ?, ?)',
          [myAccountId, providerId, officialUID, lastLogin, extraData]
        );

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
