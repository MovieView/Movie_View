import mysqlAsync, { PoolConnection } from 'mysql2/promise';
import 'dotenv/config';

let dbConnectionPoolAsync: mysqlAsync.Pool;

export async function getDBConnection(): Promise<PoolConnection> {
  if (dbConnectionPoolAsync) {
    return await dbConnectionPoolAsync.getConnection();
  }

  dbConnectionPoolAsync = mysqlAsync.createPool({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: parseInt('20'),
  });

  return await dbConnectionPoolAsync.getConnection();
}