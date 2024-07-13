import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import KakaoProvider from 'next-auth/providers/kakao';
import GoogleProvider from 'next-auth/providers/google';
import { dbConnectionPoolAsync } from './db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

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
      const connection = await dbConnectionPoolAsync.getConnection();

      try {
        const userId = user.id;
        const provider = account?.provider as string;
        const username = user.name;
        const filepath = user.image;

        const formUid = (provider: string) => {
          switch (provider) {
            case 'github':
              return 'github_' + userId;
            case 'kakao':
              return 'kakao_' + userId;
            case 'google':
              return 'google_' + userId;
          }
        };

        const [results] = await connection.execute<RowDataPacket[]>(
          `SELECT COUNT(*) AS count FROM users u LEFT JOIN social_accounts s ON u.id = s.users_id WHERE s.uid = ?`,
          [formUid(provider)]
        );
        const count = results[0].count;

        const generateUniqueInt = () => {
          const timestamp = Date.now();
          const randomNum = Math.floor(Math.random() * 1000);
          return timestamp * 1000 + randomNum;
        };

        const usersId = generateUniqueInt();
        let myAccountId;

        if (count >= 1) {
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

        const formProviderId = (provider: string) => {
          switch (provider) {
            case 'github':
              return 0;
            case 'kakao':
              return 1;
            case 'google':
              return 2;
          }
        };

        const formatDateToMySQL = (date: Date) => {
          const pad = (num: number) => (num < 10 ? '0' : '') + num;
          return (
            date.getFullYear() +
            '-' +
            pad(date.getMonth() + 1) +
            '-' +
            pad(date.getDate()) +
            ' ' +
            pad(date.getHours()) +
            ':' +
            pad(date.getMinutes()) +
            ':' +
            pad(date.getSeconds())
          );
        };

        const providerId = formProviderId(provider);
        const lastLogin = formatDateToMySQL(new Date());

        await connection.execute(
          'INSERT INTO social_accounts (users_id, providers_id, uid, last_login, extra_data) VALUES (?, ?, ?, ?, ?)',
          [myAccountId, providerId, formUid(provider), lastLogin, extraData]
        );

        await connection.commit();
        connection.release();
        return true;
      } catch (err) {
        await connection.rollback();
        connection.release();

        console.error('Failed to save user:', err);
        return false;
      }
    },
  },
};
